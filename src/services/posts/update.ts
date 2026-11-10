import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import type { UpdatePostInput } from "@/domain-types/posts/schema";

/** Applies a patch to an existing post. Returns undefined if no such post. */
export async function updatePostService({ id, patch }: UpdatePostInput) {
  const [row] = await db
    .update(posts)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();

  return row;
}
