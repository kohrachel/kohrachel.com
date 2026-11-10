import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post, type PostDraft } from "@/db/schema";

/** The live (published) copy of the fields a draft overrides. */
export function liveFields(post: Post): PostDraft {
  return {
    title: post.title,
    description: post.description,
    content: post.content,
  };
}

/** Drops unpublished edits. Returns undefined if no such post. */
export async function discardDraftService(id: number) {
  const [row] = await db
    .update(posts)
    .set({ draft: null, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return row;
}
