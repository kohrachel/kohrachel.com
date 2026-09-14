import { UpsertPostInput } from "@/domain-types/posts/schema";
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
