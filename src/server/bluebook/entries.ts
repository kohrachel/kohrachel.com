"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireWriteAccess } from "@/server/auth/gate";
import {
  MENTION_PICKER_LIMIT,
  type MentionTarget,
  type SaveEntryTextResult,
} from "@/domain-types/bluebook/entries";
import { platformName } from "@/services/bluebook/links/platform";
import { searchItemsService } from "@/services/bluebook/search/search";
import { saveEntryTextService } from "@/services/bluebook/entries/save-text";
import { ITEM_LISTS_TAG, itemTag } from "@/services/bluebook/items/cache-tags";

const findMentionTargetsSchema = z.object({
  query: z.string().trim().max(200),
  excludeItemId: z.number().int().positive(),
});

/**
 * Items for the `@` picker: search results, or the most recent items with
 * no query. The entry's own item is left out.
 */
export async function findMentionTargets(input: {
  query: string;
  excludeItemId: number;
}): Promise<MentionTarget[]> {
  await requireWriteAccess();
  const parsed = findMentionTargetsSchema.safeParse(input);
  if (!parsed.success) return [];
  const { query, excludeItemId } = parsed.data;

  const results = await searchItemsService({
    query,
    limit: MENTION_PICKER_LIMIT + 1,
  });
  return results
    .filter((result) => result.id !== excludeItemId)
    .slice(0, MENTION_PICKER_LIMIT)
    .map(({ id, title, platform }) => ({
      id,
      title,
      platform: platformName(platform),
    }));
}

const saveEntryTextSchema = z.object({
  entryId: z.number().int().positive(),
  content: z.unknown(),
});

/** Saves an entry's text, then refreshes every page that shows it. */
export async function saveEntryText(input: {
  entryId: number;
  content: unknown;
}): Promise<SaveEntryTextResult> {
  await requireWriteAccess();
  const parsed = saveEntryTextSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid" };

  const result = await saveEntryTextService(
    parsed.data.entryId,
    parsed.data.content,
  );
  if (result.ok) {
    for (const id of result.changedItemIds) updateTag(itemTag(id));
    updateTag(ITEM_LISTS_TAG);
  }
  return result;
}
