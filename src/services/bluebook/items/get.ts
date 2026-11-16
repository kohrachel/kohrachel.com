import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { entries, items } from "@/db/schema";
import type { ItemPageData } from "@/domain-types/bluebook/items";
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
      plainText: entries.plainText,
    })
    .from(entries)
    .where(eq(entries.itemId, id))
    .orderBy(desc(entries.consumedOn), desc(entries.id));

  return { ...item, entries: itemEntries };
}
