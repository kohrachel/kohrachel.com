"use server";

import { requireWriteAccess } from "@/server/auth/gate";
import { updatePostService } from "@/services/posts/update";
import { revalidatePostTags } from "@/services/posts/cache-tags";
import {
  updatePostSchema,
  type UpdatePostInput,
} from "@/domain-types/posts/schema";

export async function updatePost(input: UpdatePostInput) {
  requireWriteAccess();
  const parsed = updatePostSchema.parse(input);
  const row = await updatePostService(parsed);
  if (!row) throw new Error(`Post ${parsed.id} not found`);
  // Only publishing/unpublishing changes what the public site shows; draft
  // saves don't, so they leave the cache alone.
  if (parsed.patch.isPublished !== undefined) revalidatePostTags(row);
  return row;
}
