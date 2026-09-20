-- Supabase Storage provisioning
--
-- This file is the SOURCE OF TRUTH for storage buckets. It describes the
-- DESIRED STATE and is safe to re-run: every statement is idempotent.
--
-- What's here / not here:
--   * Buckets + defense-in-depth limits (file_size_limit, allowed_mime_types).
--   * NO RLS policies. Auth managed in app. 
--
-- Run:
--   bun run storage:setup   (loads .env, applies this file via scripts/storage-setup.ts)

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resources',
  'resources',
  true,
  5242880,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif'
  ]::text[]
)
on conflict (id) do update set
  public            = excluded.public,
  file_size_limit   = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
