import { supabaseStorage } from "./supabase";
import type { StorageService } from "./types";

export const storage: StorageService = supabaseStorage;

export type { StorageService, UploadBody, CreateUploadUrl } from "./types";

// Bucket names live here so callers reference constants, not string literals.
export const BUCKETS = {
  resources: "resources",
} as const;
