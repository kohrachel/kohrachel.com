import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post } from "@/db/schema";
import type { UpdatePostInput } from "@/domain-types/posts/schema";
import { liveFields } from "./draft";

/**
 * Applies a patch to an existing post. Returns the updated row and the slug it
 * had before, or undefined if no such post.
 */
export async function updatePostService({ id, patch }: UpdatePostInput) {
  const { isPublished, deletedAt, ...draftFields } = patch;

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .for("update");
    if (!current) return undefined;

    const changes: Partial<Post> = { updatedAt: new Date() };

    let draft = current.draft;
    if (Object.keys(draftFields).length > 0) {
      draft = { ...liveFields(current), ...draft, ...draftFields };
      changes.draft = draft;
    }

    if (isPublished === true) {
      Object.assign(changes, draft ?? {}, {
        draft: null,
        isPublished: true,
        publishedAt: current.publishedAt ?? new Date(),
      });
    } else if (isPublished === false) {
      changes.isPublished = false;
    }

    if (deletedAt) changes.deletedAt = deletedAt;

    const [row] = await tx
      .update(posts)
      .set(changes)
      .where(eq(posts.id, id))
      .returning();
    return { post: row, previousSlug: current.slug };
  });
}
