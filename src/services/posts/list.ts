import { ListInput } from "@/server/posts/list";
import { cacheTag, cacheLife } from "next/cache";
import { postSlugTag, postTag } from "./cache-tags";
import { db } from "@/db";

export function listPostService({ postIds, slug }: ListInput) {
  if (slug !== undefined) {
    cacheTag(postSlugTag(slug));
  } else if (postIds) {
    cacheTag(...postIds.map((id) => postTag(id)));
  } else {
    cacheTag(postTag());
  }
  cacheLife("minutes");

  return db.query.posts.findMany({
    columns: { draft: false },
    where: {
      isPublished: true,
      deletedAt: { isNull: true },
      ...(postIds ? { id: { in: postIds } } : {}),
      ...(slug !== undefined ? { slug } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
}
