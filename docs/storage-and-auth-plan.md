# File Storage & Write-Access Plan

Status: **Planning / not yet implemented**
Scope: how we add Supabase Storage for file uploads, and how we protect write
operations. This doc deliberately keeps two concerns **separate**:

- **Part A — Storage** (buckets, provisioning, runtime access, portability)
- **Part B — Auth / write-access** (who is allowed to mutate)

They are independent by design: moving storage to S3 later does not touch auth,
and changing the auth gate does not touch storage. Read each part on its own.

---

# Part A — Storage

## A0. Goals & constraints

- Use **Supabase Storage** (S3-compatible, 1GB free tier) for now.
- Low scale; single-author site. Don't over-engineer, don't footgun.
- Keep a cheap **escape hatch to real AWS S3** if we ever need it.
- Do **not** let Drizzle manage storage. Drizzle owns the `public` schema only
  (already enforced by `schemaFilter: ["public"]` in `drizzle.config.ts`).
  Supabase owns the `storage` schema.

## A1. The three separate storage concerns

1. **Provisioning** — creating buckets + their settings. Set once, rarely changed.
2. **Runtime access** — the app uploading/reading/deleting at request time.
3. **Metadata** — rows in _our_ `public` tables that reference stored files.

## A2. Provisioning — "Option D": one idempotent SQL file

Decision: manage buckets with a single hand-written, idempotent SQL file, run
manually. No Terraform (overkill, weak Storage coverage). No Supabase CLI
migrations (adds a second migration system alongside Drizzle — see A6).

- Location: `supabase/storage-setup.sql`
- The whole file describes **desired state** and is safe to re-run.
- Buckets via `insert into storage.buckets ... on conflict (id) do update`.
- Because we do NOT depend on RLS (see Part B), this file is mostly just bucket
  definitions. It should still set `file_size_limit` and `allowed_mime_types`
  as defense-in-depth.
- Run with: `psql "$DATABASE_URL" -f supabase/storage-setup.sql`
  (wrap in a `package.json` script, e.g. `storage:setup`).

**Adding a bucket later:** edit the same file, append the new bucket, re-run.
Idempotency makes re-running a no-op for existing buckets.

**Known limitations (accepted):** no automatic drift detection; removing a
bucket from the file does not drop it (delete buckets manually + deliberately).

## A3. Runtime access — Supabase JS client behind a thin interface

Decision: use `@supabase/supabase-js` server-side, but **only** behind a single
adapter file implementing a provider-agnostic interface. The rest of the app
never imports the Supabase SDK.

Interface (shape only — not final code):

```
interface StorageService {
  upload(bucket, key, file, contentType): Promise<string>  // returns key, not URL
  delete(bucket, key): Promise<void>
  getPublicUrl(bucket, key): string
  getSignedUrl(bucket, key, expiresInSec): Promise<string>
  createUploadUrl(bucket, key): Promise<{ url; fields? }>   // for direct uploads
}
```

- Implementation lives in e.g. `src/services/storage/supabase.ts`.
- App code (TipTap upload handler, server actions) imports the **interface**,
  never the SDK.
- Server-side uses the **service-role key** (bypasses RLS; server-only, never
  `NEXT_PUBLIC`).

## A4. Metadata — store `bucket + key`, never full URLs

Decision: our Drizzle `public` tables store `bucket` + object `key`, not full
Supabase URLs. URLs are constructed at read time via `getPublicUrl`. This keeps
rows valid across a provider move.

## A5. Buckets to start

- One **public** bucket for post/editor images (e.g. `post-images`).
  Public read is intentional (blog images). Writes are gated in Part B.
- Add a private bucket only if/when we have private content. Not now.

## A6. Why not Supabase CLI migrations

The CLI maintains its own migration-tracking table
(`supabase_migrations.schema_migrations`) — a second migration system next to
Drizzle's `__drizzle_migrations`. Two histories to reason about. The only strong
reason to adopt the CLI is the local Docker dev stack (`supabase start`); we
don't need it. If we ever do, we'd keep CLI strictly to `storage`/policies and
Drizzle strictly to `public`.

## A7. Portability: what a future move to real AWS S3 costs

Because auth is app-side (Part B) and we don't use `next/image`, a move to AWS
S3 touches only:

1. **Service file** — rewrite `supabase.ts` → `s3.ts` (`@aws-sdk/client-s3`).
2. **Provisioning** — replace `storage-setup.sql` buckets with AWS IAM/bucket
   config (Terraform/CDK/console).
3. **Dependencies** — swap SDKs.
4. **Env vars** — `SUPABASE_`* → `S3_*`.

Plus one non-code step:

1. **Data copy** — one-time `rclone` / `aws s3 sync` of existing files.

No other application code changes — **provided the invariants below hold.**

## A8. Storage invariants (enforce, don't just hope)

- **I1.** `@supabase/supabase-js` is imported in exactly the storage adapter
  file(s) and nowhere else. Enforce with an ESLint `no-restricted-imports` rule,
  scoped to allow the adapter path(s) (and any future auth adapter — see B).
- **I2.** All uploads/reads/deletes go through the `StorageService` interface.
- **I3.** DB stores `bucket + key`, never full URLs.
- **I4.** Direct browser uploads (if used) fetch a URL from `createUploadUrl`
  and do a generic `fetch(url, { method: 'PUT'/'POST', body })` — never import
  the Supabase browser client in a component.

## A9. Storage phases

1. Add `supabase/storage-setup.sql` with the `post-images` bucket + limits; add
   `storage:setup` script; run it.
2. Add the `StorageService` interface + `supabase.ts` implementation.
3. Add the ESLint rule (I1).
4. Wire TipTap image upload → a write server action → `StorageService.upload` →
   store `bucket + key` in the relevant `public` table.

---

# Part B — Auth / write-access

## B0. Goals & constraints

- Public bucket ⇒ **reads are intentionally open**. The only concern is
  **writes**: upload / delete / overwrite (storage) and post mutations
  (`savePost`).
- Single-author site. We need a **"is this me?"** gate, not user accounts.
- Auth must be independent of storage: changing it must not touch Part A.

## B1. Current state

- `/editor` is gated to `NODE_ENV === "development"` via `src/proxy.ts`
  (rewrites to not-found in prod). Real "secret" today = possession of repo +
  `.env` + ability to run dev.
- `savePost` (`src/server/posts/upsert.ts`) has **no in-action check**.

## B2. The gap to close

**Server actions are public HTTP endpoints identified by an action ID.** Next.js
may dispatch an action from routes other than its own page, and middleware route
matching (`matcher: "/editor/:path*"`) does **not** reliably gate action
invocations. Guidance: **authorize inside the action**, never rely solely on
middleware.

## B3. Decision — gate lives inside each write action, in one helper

All write actions call a single gate helper. Today the gate is the dev-mode
check; later it becomes a shared secret — swapping the helper body, nothing else.

Phase 1 (now): dev-mode gate.

```
// inside every write action (savePost, future uploadImage)
if (process.env.NODE_ENV !== "development") throw new Error("unauthorized");
```

Phase 2 (when writes must work in prod): single shared secret.

```
// src/server/auth/require-admin.ts  (shape only)
requireAdmin():
  - read `admin_token` cookie (httpOnly, secure)
  - compare to process.env.ADMIN_SECRET (server-only) via timingSafeEqual
  - throw on mismatch
```

- `ADMIN_SECRET` = one long random string in env (server-only, not
  `NEXT_PUBLIC`). This is the entire "auth database".
- Presented via a tiny login route that sets the cookie after checking a
  password. Reads stay public; only write actions call `requireAdmin()`.

## B4. Upgrade path to real auth (optional, later)

If we ever need multiple users, replace `requireAdmin()` internals with a real
provider (**Supabase Auth** = least resistance since we're already on Supabase;
**Auth.js** = provider-neutral). Note: Supabase Auth is a **separate** coupling
from Supabase Storage — moving off storage does not move auth, and vice versa.

## B5. Auth invariants

- **J1.** Every write server action (storage or DB) calls the gate helper as its
  first line. No exceptions.
- **J2.** The gate lives in one helper so Phase 1 → 2 → real-auth is a one-file
  change.
- **J3.** Do not rely on `src/proxy.ts` / middleware alone for write security;
  it's defense-in-depth, not the gate.
- **J4.** Secrets (`ADMIN_SECRET`, service-role key, S3 keys) are server-only,
  never `NEXT_PUBLIC`.

## B6. Auth phases

1. Add the in-action dev check (B3 Phase 1) to `savePost` and any new write
   action. Do this alongside Storage phase 4.
2. Keep bucket `file_size_limit` + `allowed_mime_types` (Part A) as
   defense-in-depth regardless of the gate.
3. Only if/when writes must run in prod: implement `requireAdmin()` + login
   route (B3 Phase 2).
4. Only if multi-user is ever needed: swap to a real auth provider (B4).

---

# How the two parts meet (and stay separate)

They meet at exactly one place: a **write server action** (e.g. `uploadImage`)
whose first line is the **auth gate** (Part B) and whose body calls the
**StorageService** (Part A). Neither part knows the other's internals:

```
uploadImage(input):
  requireAdmin()                         // Part B — swappable
  const key = buildKey(...)
  await storage.upload(bucket, key, ...) // Part A — swappable
  await db.insert(...).values({ bucket, key })  // metadata (Drizzle)
```

Swapping storage providers changes only Part A files. Swapping the auth model
changes only Part B files. That separation is the whole point.
