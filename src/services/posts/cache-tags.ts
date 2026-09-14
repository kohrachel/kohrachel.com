import { revalidateTag } from "next/cache";
import { Post } from "@/db/entities";

export function postTag(id?: number) {
  return id ? `post-${id}` : "posts";
}

export function revalidatePostTags(row?: Post) {
  revalidateTag(postTag(), "max");
  if (row?.id !== undefined) {
    revalidateTag(postTag(row.id), "max");
  }
}
