// Supabase adapter for StorageService. See docs/storage-and-auth-plan.md §A3.

import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { CreateUploadUrl, StorageService, UploadBody } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

// Lazily create the client so importing this module never throws at build time.
let _client: ReturnType<typeof createClient> | null = null;
function client() {
  if (_client) return _client;
  _client = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"), // server-only, bypasses RLS
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return _client;
}

export const supabaseStorage: StorageService = {
  async upload(
    bucket: string,
    key: string,
    body: UploadBody,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await client()
      .storage.from(bucket)
      .upload(key, body, { contentType, upsert: true });
    if (error) throw error;
    return data.path;
  },

  async delete(bucket: string, key: string): Promise<void> {
    const { error } = await client().storage.from(bucket).remove([key]);
    if (error) throw error;
  },

  getPublicUrl(bucket: string, key: string): string {
    return client().storage.from(bucket).getPublicUrl(key).data.publicUrl;
  },

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresInSec: number,
  ): Promise<string> {
    const { data, error } = await client()
      .storage.from(bucket)
      .createSignedUrl(key, expiresInSec);
    if (error) throw error;
    return data.signedUrl;
  },

  async createUploadUrl(bucket: string, key: string): Promise<CreateUploadUrl> {
    const { data, error } = await client()
      .storage.from(bucket)
      .createSignedUploadUrl(key);
    if (error) throw error;
    // Supabase returns a single signed URL (no extra form fields, unlike S3 POST).
    return { url: data.signedUrl };
  },
};
