import "server-only";
import { and, asc, desc, eq, inArray, isNull, max } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { entries, favorites, items, mentions, users } from "@/db/schema";
import type { ItemPageData } from "@/domain-types/bluebook/items";
import { mentionedItemIds } from "@/services/bluebook/entries/content";
import { itemTag } from "./cache-tags";

/**
 * An item with its entries (newest first), the items they mention, and the
 * other items' entries that mention it; `null` if missing or deleted.
 */
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
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
    })
    .from(entries)
    .innerJoin(users, eq(users.id, entries.userId))
    .where(eq(entries.itemId, id))
    .orderBy(desc(entries.consumedOn), desc(entries.id));

  const favoritedBy = (
    await db
      .select({ userId: favorites.userId })
      .from(favorites)
      .where(eq(favorites.itemId, id))
      .orderBy(asc(favorites.userId))
  ).map((row) => row.userId);

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

  const latestMention = max(entries.consumedOn);
  const linksOut = (
    await db
      .select({
        id: items.id,
        title: items.title,
        deletedAt: items.deletedAt,
        latestMention,
      })
      .from(mentions)
      .innerJoin(entries, eq(entries.id, mentions.entryId))
      .innerJoin(items, eq(items.id, mentions.targetItemId))
      .where(eq(entries.itemId, id))
      .groupBy(items.id)
      .orderBy(desc(latestMention), asc(items.id))
  ).map(({ id: targetId, title, deletedAt }) => ({
    id: targetId,
    title: deletedAt ? null : title,
  }));

  const mentionedIn = (
    await db
      .select({
        itemId: items.id,
        title: items.title,
        deletedAt: items.deletedAt,
        consumedOn: entries.consumedOn,
        consumedPrecision: entries.consumedPrecision,
        context: mentions.context,
      })
      .from(mentions)
      .innerJoin(entries, eq(entries.id, mentions.entryId))
      .innerJoin(items, eq(items.id, entries.itemId))
      .where(eq(mentions.targetItemId, id))
      .orderBy(desc(entries.consumedOn), desc(entries.id))
  ).map(({ deletedAt, title, context, ...mention }) => ({
    ...mention,
    title: deletedAt ? null : title,
    context: deletedAt ? "" : context,
  }));

  // Linked items' titles show here, so their changes refresh this page.
  for (const link of [...linksOut, ...mentionedIn]) {
    cacheTag(itemTag("itemId" in link ? link.itemId : link.id));
  }

  return {
    ...item,
    entries: itemEntries.map(({ author, ...entry }) => ({
      ...entry,
      author: {
        id: author.id,
        username: author.username ?? "",
        displayName: author.displayName ?? author.username ?? "",
      },
    })),
    favoritedBy,
    mentionedTitles,
    linksOut,
    mentionedIn,
  };
}
