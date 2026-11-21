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

The blog and bluebook have **separate logins** that share no code, cookies or
users. The blog has one writer and a shared-secret password. Bluebook has a few
invited accounts.

## B0. Goals & constraints

- Reads are public on both sites. Auth only guards writes (and the blog
  editor's unpublished drafts).
- Blog: one writer (the owner). Bluebook: invite-only, 10 people at most.
- This is **not** meant to be a production-grade auth surface: no multiple
  providers, no account linking, no self-service account management. Nice if we
  get them later, but we don't design for them.
- A session lasts indefinitely on each device, and signing in on one device
  never signs out another.
- Sign-in must work on Vercel previews, not just locally and in production.
- Auth stays independent of storage (Part A).

## B1. The rule for server actions

**Server actions are public HTTP endpoints identified by an action ID.** Next.js
may dispatch an action from routes other than its own page, and middleware route
matching does **not** reliably gate action invocations. So: **authorize inside
the action**, never rely solely on `src/proxy.ts`.

## B2. Blog: shared-secret admin login (implemented)

- Code: `src/server/auth/session.ts`, `gate.ts`, `login.ts`. Log in at
  `kohrachel.com/admin/login` with `ADMIN_SECRET`.
- The cookie holds a signed expiry (HMAC with `ADMIN_SECRET`), not the secret
  itself, and lasts 90 days. `next dev` is always allowed without logging in.
- Write actions and editor reads call `requireWriteAccess()`; pages that show
  owner-only UI call `canWrite()`.
- `/editor` is still hidden in production by `src/proxy.ts`, so in production
  this login unlocks nothing until the editor goes live. We keep it for then.

Changes when bluebook gets its own login (B5 step 2):

- The cookie becomes host-only (`kohrachel.com`). Today it is set on
  `Domain=kohrachel.com`, which shares it with `bluebook.kohrachel.com`.
- `requireWriteAccess()` / `canWrite()` become blog-only. No bluebook code
  calls them.
- After deploying, change `ADMIN_SECRET` once. Browsers keep the old shared
  cookie for up to 90 days, and logging out only clears the new host-only one;
  a new secret makes every old cookie invalid.

## B3. Bluebook: accounts

### Decisions

- **Our own code, not Supabase Auth or Auth.js.** The requirements are small,
  and users, roles and sessions need our own tables either way. Users and
  sessions live in the `bluebook` schema under Drizzle, removing a session
  takes effect immediately, there is no second user list to keep in step, the
  Supabase SDK stays limited to the storage adapter (I1), and the login moves
  with bluebook if it ever leaves this repo.
- **Username or email, plus a password.** Considered and set aside for v1:
  - Emailed codes or links: the inbox becomes the only key to the account, and
    it needs an email service.
  - Sign in with Google: needs a Google Cloud OAuth app, and Google doesn't
    allow wildcard return addresses, so previews would need a relay through
    production. Passwords work on previews with no extra code.
- **Invite-only through the `users` table.** A user row is the invite. There is
  no public sign-up page and no allowlist env var.
- **No `logins` table in v1.** The password hash lives on `users`. Adding
  another sign-in method later is a new table; nothing existing moves.
- **No pepper.** A slow hash with a per-user salt is enough at this size.

### Data (`bluebook` schema)

`users`

| column | notes |
|---|---|
| `id` | |
| `email` | Unique, stored lowercase. Private: never shown on any page. |
| `username` | Unique ignoring case. Letters, numbers, `_` and `-`. Null until setup is finished. |
| `display_name` | Not unique. Null until setup is finished. |
| `role` | `owner` or `member`. |
| `password_hash` | One string with algorithm, settings, salt and hash: `$scrypt$n=…,r=8,p=1$<salt>$<hash>`. Null until setup is finished. |
| `setup_token_hash`, `setup_token_expires_at` | The current setup link, stored as a hash. Null when there's none. |
| `failed_sign_ins`, `locked_until` | Limits password guessing. |
| `disabled_at` | Set → can't sign in, sessions stop working. Their entries stay up. |
| `created_at` | |

`sessions`

| column | notes |
|---|---|
| `id` | |
| `user_id` | |
| `token_hash` | Hash of the session ID in the cookie, so reading the database doesn't let anyone sign in. |
| `created_at`, `last_used_at`, `expires_at` | |

`entries` gets a `user_id` (required once existing entries are filled in; see
"Existing data"). Items don't record who added them: an item is shared by
everyone and its link stays unique across the site.

### Flows

**Invite.** `bun run bluebook:invite <email>` creates the user row (or finds
it), makes a random setup token, stores its hash with a 24-hour expiry, and
prints `https://bluebook.kohrachel.com/setup/<token>` (with an option for
another base URL, such as a preview). The owner sends the link however they
like.

**Setup** (`/setup/<token>`). Checks the token matches, hasn't expired, and the
user isn't disabled. A first-time user picks a username and display name
(pre-filled from their email); everyone picks a password. On save: store the
password hash, clear the token, delete the user's other sessions, and sign in on
this device.

**Password reset.** Run the invite script again for that person. It prints a
new link and the old one stops working. The setup page then only asks for a
password. There is no "forgot password" email, so email is never a way in.

**Sign in** (`/login`). Username or email, plus password. Locked, disabled,
unknown account and wrong password all show the same "Wrong username or
password." For an unknown account we still hash the password so the response
takes the same time. After 10 wrong passwords in a row the account waits 15
minutes; a successful sign-in resets the count.

**Sessions.** The `bluebook_session` cookie holds a random 32-byte session ID:
`httpOnly`, `secure`, `sameSite=lax`, host-only. Each request looks up the
session and its user in one query (cached per request) and rejects expired
sessions and disabled users. When a write action runs and the session hasn't
been extended in the last day, its expiry moves out and the cookie is set again
(cookies can only be set from server actions, not while a page renders). Chrome
caps cookies at 400 days, so that's the lifetime; a device that saves something
at least once in that window stays signed in indefinitely.

**Sign out.** Deletes the session row and clears the cookie.

**Disable.** By hand in the database: set `disabled_at` and delete the user's
sessions.

### Permissions

| action | anyone | member | owner |
|---|---|---|---|
| Read everything | ✓ | ✓ | ✓ |
| Add an item or entry | | ✓ | ✓ |
| Fix an item's details | | ✓ | ✓ |
| Edit or delete an entry (date, text, mentions) | | their own | anyone's |
| Delete an item (deletes everyone's entries on it) | | | ✓ |

Bluebook has its own gate helpers (who's signed in, require a member, require
the entry's author or the owner, require the owner), called inside each server
action. Finer-grained roles can be added later on top of `role`.

Open: favorites. `items.is_favorite` is one flag for the whole site. Decide in
B5 step 3 whether favorites become per person (a small favorites table) or
stay one flag that only the owner sets.

### Password storage

- Node's built-in `scrypt` (Bun's password helpers don't exist on Vercel's Node
  runtime), at or above OWASP's minimum (`n=2^17, r=8, p=1`), with a random
  16-byte salt per user, stored next to the hash.
- Compare with `timingSafeEqual`.
- The settings are stored in the hash string, so if we raise them later, an
  older hash is redone with the new settings the next time that person signs in.
- Passwords: at least 8 characters, up to 256, no composition rules (NIST).

### Local dev and previews

- `next dev`: treated as signed in as the owner unless actually signed in.
  `BLUEBOOK_DEV_USER=<username>` acts as someone else.
- Previews: real sign-in works, since nothing depends on a fixed address. They
  use whichever database their env points to.

### Existing data

The tables PR is schema-only and adds `entries.user_id` as nullable. Then, by
hand: create the owner user and set every existing entry's `user_id` to them. A
later migration makes the column required.

### Code layout

- Tables: `src/db/entities/bluebook/users.ts`, `sessions.ts`.
- Logic (hashing, sessions, setup tokens): `src/services/bluebook/auth/`.
- Gate and sign-in/out/setup actions: `src/server/bluebook/auth/`.
- Pages: `src/app/(bluebook)/bluebook/login/`, `setup/[token]/`.
- Script: `scripts/bluebook-invite.ts` (`bluebook:invite`).

## B4. Auth invariants

- **J1.** Every write server action calls **its own site's** gate as its first
  line: blog actions the blog gate, bluebook actions the bluebook gate. Never
  the other site's.
- **J2.** Each site's gate lives in one place.
- **J3.** Do not rely on `src/proxy.ts` / middleware alone for write security;
  it's defense-in-depth, not the gate.
- **J4.** Secrets (`ADMIN_SECRET`, service-role key, S3 keys) are server-only,
  never `NEXT_PUBLIC`.
- **J5.** Emails, password hashes and token hashes never leave the server.
  Pages show only usernames and display names.
- **J6.** Session IDs and setup tokens are stored only as hashes.

## B5. Bluebook auth phases (one PR each, stacked)

1. **Tables.** `users`, `sessions`, nullable `entries.user_id`. Schema only.
   Then by hand: owner user, backfill entries.
2. **Sign-in.** Password hashing, sessions, invite script, setup and login
   pages, sign-out, bluebook gate helpers, `next dev` shortcut. Bluebook pages
   and actions switch to "signed-in member" and stop calling the blog gate; the
   add page links to bluebook's `/login`. In the same PR: the blog cookie
   becomes host-only (B2). Change `ADMIN_SECRET` after deploying.
3. **Per-person permissions.** New entries record their author, the
   permissions table is enforced, the item page shows who logged it and when,
   `entries.user_id` becomes required, and favorites change if we decide so.

Later: personal API keys for the iOS Shortcut (#86) and browser extension
(#105); more sign-in methods (a `logins` table); finer-grained roles.

---

# How the two parts meet (and stay separate)

They meet at exactly one place: a **write server action** (e.g. `uploadImage`)
whose first line is the **auth gate** (Part B) and whose body calls the
**StorageService** (Part A). Neither part knows the other's internals:

```
uploadImage(input):
  requireWriteAccess()                   // Part B — the site's gate
  const key = buildKey(...)
  await storage.upload(bucket, key, ...) // Part A — swappable
  await db.insert(...).values({ bucket, key })  // metadata (Drizzle)
```

Swapping storage providers changes only Part A files. Swapping the auth model
changes only Part B files. That separation is the whole point.
