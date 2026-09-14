import { UpsertPostInput } from "@/server/posts/upsert";
import { db } from "@/db";
import { posts } from "@/db/entities";

export async function upsertPostService(input: UpsertPostInput) {
  const [row] = await db
    .insert(posts)
    .values(input)
    .onConflictDoUpdate({
      target: posts.id,
      set: input,
    })
    .returning();

  return row;
}
