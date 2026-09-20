"use cache";

import { z } from "zod";
import { listPostService } from "@/services/posts/list";

export const listInputSchema = z.object({
  postIds: z.array(z.number().int().positive()).min(1).optional(),
});

export type ListInput = z.infer<typeof listInputSchema>;

export async function listPosts(input: ListInput) {
  const parsed = listInputSchema.parse(input);
  return listPostService(parsed);
}
