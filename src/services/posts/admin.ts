import { db } from "@/db";
import { liveFields } from "./draft";

// Editor-only reads. Unlike `listPostService`, these are uncached and include
// unpublished posts.

export function listAllPostsService() {
  return db.query.posts.findMany({
    columns: {
      id: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
    },
    extras: {
      title: (t, { sql }) =>
        sql<string>`coalesce(${t.draft} ->> 'title', ${t.title})`,
      hasDraft: (t, { sql }) => sql<boolean>`${t.draft} is not null`,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPostService(id: number) {
  const post = await db.query.posts.findFirst({ where: { id } });
  if (!post) return undefined;

  return {
    id: post.id,
    createdAt: post.createdAt,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt,
    hasDraft: post.draft !== null,
    ...(post.draft ?? liveFields(post)),
  };
}
