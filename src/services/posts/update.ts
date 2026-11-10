import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post } from "@/db/schema";
import type { UpdatePostInput } from "@/domain-types/posts/schema";
import { liveFields } from "./draft";

/**
 * Applies a patch to an existing post. Returns undefined if no such post.
 *
 * - title/description/content are merged into the draft. The live columns
 *   are not touched, so a published post doesn't change until it's published.
 * - isPublished: true copies the draft (if any) to the live columns, clears
 *   it, and sets publishedAt on the first publish.
 * - isPublished: false hides the post and keeps both the live copy and draft.
 */
export async function updatePostService({ id, patch }: UpdatePostInput) {
  const { isPublished, ...draftFields } = patch;

  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .for("update");
    if (!current) return undefined;

    const changes: Partial<Post> = { updatedAt: new Date() };

    let draft = current.draft;
    if (Object.keys(draftFields).length > 0) {
      draft = { ...(draft ?? liveFields(current)), ...draftFields };
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

    const [row] = await tx
      .update(posts)
      .set(changes)
      .where(eq(posts.id, id))
      .returning();
    return row;
  });
}
