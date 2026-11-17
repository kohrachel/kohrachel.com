import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { entries, items } from "@/db/schema";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import { mentionedItemIds } from "@/services/bluebook/entries/content";
import { itemTag } from "./cache-tags";

/** An item with its entries, newest first; `null` if missing or deleted. */
export async function getItemService(id: number): Promise<ItemPageData | null> {
  cacheTag(itemTag(id));
  cacheLife("hours");

  const [item] = await db
    .select({
      id: items.id,
      url: items.url,
      normalizedUrl: items.normalizedUrl,
      platform: items.platform,
      title: items.title,
      creator: items.creator,
      publishedAt: items.publishedAt,
      metadata: items.metadata,
      isFavorite: items.isFavorite,
    })
    .from(items)
    .where(and(eq(items.id, id), isNull(items.deletedAt)));
  if (!item) return null;

  const itemEntries = await db
    .select({
      id: entries.id,
      consumedOn: entries.consumedOn,
      consumedPrecision: entries.consumedPrecision,
      content: entries.content,
      plainText: entries.plainText,
      contentEditedAt: entries.contentEditedAt,
    })
    .from(entries)
    .where(eq(entries.itemId, id))
    .orderBy(desc(entries.consumedOn), desc(entries.id));

  // A mentioned item's title shows here, so its changes refresh this page.
  const ids = [
    ...new Set(itemEntries.flatMap((entry) => mentionedItemIds(entry.content))),
  ];
  for (const mentionedId of ids) cacheTag(itemTag(mentionedId));
  const mentioned = ids.length
    ? await db
        .select({
          id: items.id,
          title: items.title,
          deletedAt: items.deletedAt,
        })
        .from(items)
        .where(inArray(items.id, ids))
    : [];
  const mentionedTitles = Object.fromEntries(
    mentioned.map(({ id, title, deletedAt }) => [id, deletedAt ? null : title]),
  );

  return { ...item, entries: itemEntries, mentionedTitles };
}
