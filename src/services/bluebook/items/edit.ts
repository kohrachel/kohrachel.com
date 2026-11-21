import "server-only";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, items, mentions } from "@/db/schema";
import type { EditResult } from "@/domain-types/bluebook/edit";

const NOT_FOUND: EditResult = { ok: false, error: "That item doesn't exist." };

const live = (id: number) => and(eq(items.id, id), isNull(items.deletedAt));

/** Changes an item's title, creator and publish date. */
export async function updateItemService(input: {
  id: number;
  title: string;
  creator: string | null;
  publishedAt: string | null;
}): Promise<EditResult> {
  const [updated] = await db
    .update(items)
    .set({
      title: input.title,
      creator: input.creator,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      updatedAt: sql`now()`,
    })
    .where(live(input.id))
    .returning({ id: items.id });
  return updated ? { ok: true, itemId: updated.id } : NOT_FOUND;
}

export async function setFavoriteService(
  id: number,
  isFavorite: boolean,
): Promise<EditResult> {
  const [updated] = await db
    .update(items)
    .set({ isFavorite, updatedAt: sql`now()` })
    .where(live(id))
    .returning({ id: items.id });
  return updated ? { ok: true, itemId: updated.id } : NOT_FOUND;
}

/**
 * Soft-deletes an item. Its entries are kept, and pasting its link again
 * restores it with them.
 */
export async function deleteItemService(id: number): Promise<EditResult> {
  const [deleted] = await db
    .update(items)
    .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
    .where(live(id))
    .returning({ id: items.id });
  return deleted ? { ok: true, itemId: deleted.id } : NOT_FOUND;
}

/**
 * Deletes an entry for good. An item keeps at least one entry; to remove
 * the last one, delete the item.
 */
export async function deleteEntryService(id: number): Promise<EditResult> {
  return db.transaction(async (tx) => {
    const [entry] = await tx
      .select({ itemId: entries.itemId })
      .from(entries)
      .innerJoin(
        items,
        and(eq(items.id, entries.itemId), isNull(items.deletedAt)),
      )
      .where(eq(entries.id, id));
    if (!entry) return { ok: false, error: "That entry doesn't exist." };

    // Locks the item, so two deletes can't both see a second entry.
    await tx
      .select({ id: items.id })
      .from(items)
      .where(eq(items.id, entry.itemId))
      .for("update");
    const [{ total }] = await tx
      .select({ total: count() })
      .from(entries)
      .where(eq(entries.itemId, entry.itemId));
    if (total <= 1) {
      return {
        ok: false,
        error: "This is the only entry. Delete the item instead.",
      };
    }

    // Items this entry mentions lose it from their "Mentioned in".
    const mentioned = await tx
      .select({ targetItemId: mentions.targetItemId })
      .from(mentions)
      .where(eq(mentions.entryId, id));
    await tx.delete(entries).where(eq(entries.id, id));
    return {
      ok: true,
      itemId: entry.itemId,
      alsoChangedItemIds: mentioned.map((mention) => mention.targetItemId),
    };
  });
}
