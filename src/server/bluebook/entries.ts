"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireWriteAccess } from "@/server/auth/gate";
import type { SaveEntryTextResult } from "@/domain-types/bluebook/entries";
import { saveEntryTextService } from "@/services/bluebook/entries/save-text";
import { ITEM_LISTS_TAG, itemTag } from "@/services/bluebook/items/cache-tags";

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
