import { db } from "@/db";

// Editor-only reads. Unlike `listPostService`, these are uncached and include
// unpublished posts.

export function listAllPostsService() {
  return db.query.posts.findMany({
    columns: {
      id: true,
      title: true,
      isPublished: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPostService(id: number) {
  return db.query.posts.findFirst({ where: { id } });
}
