"use cache";

import { listPostService } from "@/services/posts/list";

export type ListInput = {
  postIds?: number[];
};

export async function listPosts(input: ListInput) {
  return listPostService(input);
}
