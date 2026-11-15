import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { entries, items } from "@/db/schema";
import type { ExistingItem, PreviewResult } from "@/domain-types/bluebook/add";
import { fetchDetails } from "@/services/bluebook/details/fetch-details";
import { cleanLink } from "@/services/bluebook/links/clean";

/**
 * Turns pasted text into what the confirm form needs: the cleaned link,
 * whether an item already has it, and details to pre-fill. Saves nothing.
 */
export async function previewLinkService(text: string): Promise<PreviewResult> {
  const link = await cleanLink(text);
  if (!link.ok) return link;

  const existing = await findItem(link.normalizedUrl);
  const details =
    existing && !existing.isDeleted
      ? null
      : await fetchDetails({ ...link, pastedText: text });

  return {
    ok: true,
    url: link.url,
    resolvedUrl: link.resolvedUrl,
    normalizedUrl: link.normalizedUrl,
    commonPlatform: link.commonPlatform,
    existing,
    details,
  };
}

/** The item with this link, deleted or not, with a summary of its entries. */
export async function findItem(
  normalizedUrl: string,
): Promise<ExistingItem | null> {
  const [row] = await db
    .select({
      id: items.id,
      title: items.title,
      creator: items.creator,
      platform: items.platform,
      deletedAt: items.deletedAt,
      entryCount: count(entries.id),
    })
    .from(items)
    .leftJoin(entries, eq(entries.itemId, items.id))
    .where(eq(items.normalizedUrl, normalizedUrl))
    .groupBy(items.id);
  if (!row) return null;

  const [lastConsumed] = await db
    .select({ on: entries.consumedOn, precision: entries.consumedPrecision })
    .from(entries)
    .where(eq(entries.itemId, row.id))
    .orderBy(desc(entries.consumedOn), desc(entries.id))
    .limit(1);

  const { deletedAt, ...item } = row;
  return {
    ...item,
    isDeleted: deletedAt !== null,
    lastConsumed: lastConsumed ?? null,
  };
}
