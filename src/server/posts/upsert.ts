"use server";

import { IPost } from "@/db/entities";
import { upsertPostService } from "@/services/posts/upsert";
import { revalidatePostTags } from "@/services/posts/cache-tags";

export type UpsertPostInput = {
  id?: number;
  title?: string | null;
  description?: string | null;
  content?: IPost["content"];
};

export async function savePost(input: UpsertPostInput) {
  const row = await upsertPostService(input);
  revalidatePostTags(row);
  return row;
}
