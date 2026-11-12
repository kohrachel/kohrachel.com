import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post, type PostDraft } from "@/db/schema";

export function liveFields(post: Post): PostDraft {
  return {
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: post.content,
  };
}

export async function discardDraftService(id: number) {
  const [row] = await db
    .update(posts)
    .set({ draft: null, updatedAt: new Date() })
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
    .returning();
  return row;
}
