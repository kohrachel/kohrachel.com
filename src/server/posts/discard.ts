"use server";

import { requireWriteAccess } from "@/server/auth/gate";
import { discardDraftService } from "@/services/posts/draft";
import { postIdSchema } from "@/domain-types/posts/schema";

// No revalidation: the draft is never shown publicly, so nothing cached changes.
export async function discardDraft(id: number) {
  requireWriteAccess();
  const postId = postIdSchema.parse(id);
  const row = await discardDraftService(postId);
  if (!row) throw new Error(`Post ${postId} not found`);
  return row;
}
