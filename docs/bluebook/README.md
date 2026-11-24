# bluebook

A public log of things watched and read across the internet, at
`bluebook.kohrachel.com`. Paste a link, it's saved with its details, and each
time you watch or read it is an entry you can write about and connect to other
things with `@` mentions.

It lives in this repo as a second site: the same Next.js app, served on the
`bluebook.` host by a rewrite in `next.config.ts`, and the same Supabase
database, in its own `bluebook` schema. Code is in bluebook-named folders under
`src/app/(bluebook)`, `src/server/bluebook`, `src/services/bluebook`,
`src/db/entities/bluebook`, `src/domain-types/bluebook` and `src/lib/bluebook`.

How sign-in and permissions work, and why: Part B of
[`docs/storage-and-auth-plan.md`](../storage-and-auth-plan.md).

## Commands at a glance

| What                                    | Command                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Run the site locally                    | `bun run dev`, then open http://localhost:3000/bluebook                  |
| Invite someone, or reset their password | `bun run bluebook:invite <email> [--base-url <url>]`                     |
| Make a database migration               | `bunx drizzle-kit generate --name <name>`                                |
| Apply migrations                        | `bunx drizzle-kit migrate`                                               |
| Run tests (skips database tests)        | `bun test`                                                               |
| Run tests with database tests           | `TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5499/postgres bun test` |

## Environment variables

| Variable            | Where          | What it's for                                                                                       |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | `.env`, Vercel | The database. Scripts and `drizzle-kit` use it too.                                                 |
| `YOUTUBE_API_KEY`   | `.env`, Vercel | Optional. Fetches YouTube details when adding a link; without it, YouTube links get less filled in. |
| `BLUEBOOK_DEV_USER` | `.env`         | Optional, `next dev` only. A username to act as; see "Running locally".                             |
| `TEST_DATABASE_URL` | your shell     | Turns on the database tests. Must be on this machine; see "Tests".                                  |

## Running locally

`bun run dev`, then open http://localhost:3000/bluebook. On `localhost` (and on
Vercel previews) bluebook's pages are under `/bluebook`; only the `bluebook.`
host serves them at the root.

Under `next dev` you're treated as signed in without logging in: as the owner,
or as the user named in `BLUEBOOK_DEV_USER` (e.g. `BLUEBOOK_DEV_USER=member`
to see a member's view). That only works if the database in `DATABASE_URL`
has that user and they've finished setup. Signing in for real at
`/bluebook/login` takes priority over this.

## Accounts

bluebook is invite-only. Each person has a row in `bluebook.users`; there's no
sign-up page. Roles are `owner`, `admin` and `member`. Owners and admins can
change anyone's entries and delete any item; members change only their own
entries and delete only items no one else has logged.

### Invite someone, or reset a password

```sh
bun run bluebook:invite friend@example.com
```

This adds the user if they're new and prints a one-time setup link that
expires in 24 hours. Send it to them however you like. Opening it, a new user
picks a username, display name and password; for someone already set up, it's
a password reset. Running it again makes a new link, and the old one stops
working.

`--base-url` is the start of the printed link; the script adds
`/setup/<token>` to it. Leave it out for real invites. It defaults to
`https://bluebook.kohrachel.com`. Change it when the link should open
somewhere else:

- Local dev: `--base-url http://localhost:3000/bluebook`
- A Vercel preview: `--base-url https://<preview-address>.vercel.app/bluebook`

Both need the `/bluebook` on the end, since only the `bluebook.` host serves
bluebook at the root.

The link only works on a site that uses **the same database** the script
wrote to: the `DATABASE_URL` in your `.env` when you ran it. If your `.env`
points at production, a `localhost` link only works if your local site also
uses the production database.

### Make someone an admin, or a member again

```sql
update bluebook.users set role = 'admin' where lower(username) = lower('their-username');
update bluebook.users set role = 'member' where lower(username) = lower('their-username');
```

### Remove someone

Disable them rather than deleting them: their entries stay up, and they can't
sign in. Their sessions stop working right away; deleting them just tidies
up.

```sql
update bluebook.users set disabled_at = now() where lower(username) = lower('their-username');
delete from bluebook.sessions
where user_id = (select id from bluebook.users where lower(username) = lower('their-username'));
```

To let them back in, set `disabled_at = null`. Their old password works again.

## Database migrations

`drizzle-kit` manages the `public` and `bluebook` schemas (see
`drizzle.config.ts`).

1. Change the tables in `src/db/entities/bluebook/`.
2. `bunx drizzle-kit generate --name <what-changed>` writes the migration to
   `src/db/migrations/`. Drizzle doesn't manage Postgres extensions, so those
   are added to the SQL by hand (as in the PGroonga search index migration).
3. `bunx drizzle-kit migrate` applies it to the database in `DATABASE_URL`.
   Run it before merging when the new code needs the new schema, since the
   Vercel build reads the production database.

Migrations change structure only. Data changes (backfills) are run by hand and
written up in the PR, not committed.

## Tests

`bun test` runs everything, but quietly skips the database tests unless
`TEST_DATABASE_URL` is set. Always run them before a PR that touches the
database, queries or transactions. They need a throwaway local Postgres 18
with PGroonga; they never run against Supabase (`src/test/setup.ts` refuses
any non-local address).

### One-time setup

```sh
brew install postgresql@18 pgroonga
PG=/opt/homebrew/opt/postgresql@18/bin
$PG/initdb -D tmp/test-pg -U postgres --auth=trust -E UTF8
$PG/pg_ctl -D tmp/test-pg -o "-p 5499 -k /tmp" -l tmp/test-pg.log start
$PG/psql postgres://postgres@127.0.0.1:5499/postgres \
  -c "create schema extensions" \
  -c "alter database postgres set search_path = public, extensions"
for f in src/db/migrations/*bluebook*/migration.sql; do
  $PG/psql postgres://postgres@127.0.0.1:5499/postgres -v ON_ERROR_STOP=1 -f "$f"
done
```

`tmp/` is gitignored. The `extensions` schema matches where Supabase keeps
PGroonga.

### Each time

```sh
PG=/opt/homebrew/opt/postgresql@18/bin
$PG/pg_ctl -D tmp/test-pg -o "-p 5499 -k /tmp" -l tmp/test-pg.log start
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5499/postgres bun test
$PG/pg_ctl -D tmp/test-pg stop
```

After pulling new bluebook migrations, apply just those to the test database
with the same `psql -f` line. Or delete `tmp/test-pg` and redo the setup.
