import { db } from "@/db";
import { liveFields } from "./draft";

// Editor-only reads. Unlike `listPostService`, these are uncached and include
// unpublished posts. Both show the draft where there is one, since that's
// what the editor is working on.

export function listAllPostsService() {
  return db.query.posts.findMany({
    columns: {
      id: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
    },
    // Computed in SQL so the list doesn't load every draft's content.
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
    isPublished: post.isPublished,
    publishedAt: post.publishedAt,
    hasDraft: post.draft !== null,
    ...(post.draft ?? liveFields(post)),
  };
}
