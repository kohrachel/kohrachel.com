"use server";

import { requireWriteAccess } from "@/server/auth/gate";
import { updatePostService } from "@/services/posts/update";
import { revalidatePostTags } from "@/services/posts/cache-tags";
import {
  updatePostSchema,
  type UpdatePostInput,
  type UpdatePostResult,
} from "@/domain-types/posts/schema";

const SLUG_FORMAT_MESSAGE =
  "Slugs are lowercase letters and numbers joined by single hyphens, and can't be only numbers";
const SLUG_RESERVED_MESSAGE = "That slug is reserved";

const CONSTRAINT_MESSAGES: Record<string, string> = {
  posts_slug_format_check: SLUG_FORMAT_MESSAGE,
  posts_draft_slug_format_check: SLUG_FORMAT_MESSAGE,
  posts_slug_reserved_check: SLUG_RESERVED_MESSAGE,
  posts_draft_slug_reserved_check: SLUG_RESERVED_MESSAGE,
  posts_slug_unique: "Another post already uses that slug",
  posts_published_has_slug_check: "Add a slug before publishing",
};

function constraintMessage(error: unknown) {
  for (let e = error; e instanceof Error; e = e.cause) {
    const name = (e as { constraint_name?: unknown }).constraint_name;
    if (typeof name === "string" && name in CONSTRAINT_MESSAGES) {
      return CONSTRAINT_MESSAGES[name];
    }
  }
}

export async function updatePost(
  input: UpdatePostInput,
): Promise<UpdatePostResult> {
  requireWriteAccess();
  const parsed = updatePostSchema.parse(input);
  let updated;
  try {
    updated = await updatePostService(parsed);
  } catch (error) {
    const message = constraintMessage(error);
    if (!message) throw error;
    return { error: message };
  }
  if (!updated) throw new Error(`Post ${parsed.id} not found`);
  // Only publishing, unpublishing and deleting change what the public site shows
  if (parsed.patch.isPublished !== undefined || parsed.patch.deletedAt) {
    revalidatePostTags(updated.post, updated.previousSlug);
  }
  return { post: updated.post };
}
