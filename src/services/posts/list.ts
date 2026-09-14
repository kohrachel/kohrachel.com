import { ListInput } from "@/server/posts/list";
import { cacheTag, cacheLife } from "next/cache";
import { postTag } from "./cache-tags";
import { db } from "@/db";

export function listPostService({ postIds }: ListInput) {
  if (postIds) {
    cacheTag(...postIds.map((id) => postTag(id)));
  } else {
    cacheTag(postTag());
  }
  cacheLife("hours");

  return db.query.posts.findMany({
    where: postIds ? { id: { in: postIds } } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}
