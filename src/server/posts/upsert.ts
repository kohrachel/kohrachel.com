"use server";

import { upsertPostService } from "@/services/posts/upsert";
import { revalidatePostTags } from "@/services/posts/cache-tags";
import {
  upsertPostSchema,
  type UpsertPostInput,
} from "@/domain-types/posts/schema";

export async function savePost(input: UpsertPostInput) {
  const parsed = upsertPostSchema.parse(input);
  const row = await upsertPostService(parsed);
  revalidatePostTags(row);
  return row;
}
