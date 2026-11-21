"use server";

import { updateTag } from "next/cache";
import { requireMember } from "@/server/bluebook/auth/gate";
import {
  previewInputSchema,
  saveInputSchema,
  type PreviewInput,
  type PreviewResult,
  type SaveInput,
  type SaveResult,
} from "@/domain-types/bluebook/add";
import { previewLinkService } from "@/services/bluebook/add/preview";
import { cleanEntryContent } from "@/services/bluebook/entries/content";
import { saveEntryTextService } from "@/services/bluebook/entries/save-text";
import { saveLinkService } from "@/services/bluebook/add/save";
import { ITEM_LISTS_TAG, itemTag } from "@/services/bluebook/items/cache-tags";

/** Cleans up a pasted link and fetches details for the confirm form. */
export async function previewLink(input: PreviewInput): Promise<PreviewResult> {
  const actor = await requireMember();
  const { text } = previewInputSchema.parse(input);
  return previewLinkService(text, actor.id);
}

/**
 * Saves a confirmed link as a new item, a new entry, or a restored item,
 * and, if `entryText` is given, the new entry's text. The text is checked
 * first, so invalid text saves nothing.
 */
export async function saveLink(
  input: SaveInput,
  entryText?: unknown,
): Promise<SaveResult> {
  const actor = await requireMember();
  const parsed = saveInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  if (entryText !== undefined && !cleanEntryContent(entryText)) {
    return { ok: false, error: "That text can't be saved." };
  }

  const result = await saveLinkService(actor, parsed.data);
  if (!result.ok) return result;
  updateTag(itemTag(result.itemId));
  updateTag(ITEM_LISTS_TAG);
  if (entryText === undefined) return result;

  const text = await saveEntryTextService(actor, result.entryId, entryText);
  if (!text.ok) return { ...result, textError: text.error };
  for (const id of text.changedItemIds) updateTag(itemTag(id));
  return result;
}
