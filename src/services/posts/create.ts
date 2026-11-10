import { db } from "@/db";
import { posts } from "@/db/schema";

/** Inserts an empty, unpublished post and returns it. */
export async function createPostService() {
  const [row] = await db.insert(posts).values({}).returning();
  return row;
}
