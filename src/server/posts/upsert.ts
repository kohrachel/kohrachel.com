"use server";

import { z } from "zod";
import { IPost } from "@/db/entities";
import { upsertPostService } from "@/services/posts/upsert";
import { revalidatePostTags } from "@/services/posts/cache-tags";

export const upsertPostSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  content: z.custom<IPost["content"]>().optional(),
});

export type UpsertPostInput = z.infer<typeof upsertPostSchema>;

export async function savePost(input: UpsertPostInput) {
  const parsed = upsertPostSchema.parse(input);
  const row = await upsertPostService(parsed);
  revalidatePostTags(row);
  return row;
}
