"use server";

import { updateTag } from "next/cache";
import { requireWriteAccess } from "@/server/auth/gate";
import {
  previewInputSchema,
  saveInputSchema,
  type PreviewInput,
  type PreviewResult,
  type SaveInput,
  type SaveResult,
} from "@/domain-types/bluebook/add";
import { previewLinkService } from "@/services/bluebook/add/preview";
import { saveLinkService } from "@/services/bluebook/add/save";
import { itemTag } from "@/services/bluebook/items/cache-tags";

/** Cleans up a pasted link and fetches details for the confirm form. */
export async function previewLink(input: PreviewInput): Promise<PreviewResult> {
  await requireWriteAccess();
  const { text } = previewInputSchema.parse(input);
  return previewLinkService(text);
}

/** Saves a confirmed link as a new item, a new entry, or a restored item. */
export async function saveLink(input: SaveInput): Promise<SaveResult> {
  await requireWriteAccess();
  const parsed = saveInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const result = await saveLinkService(parsed.data);
  if (result.ok) updateTag(itemTag(result.itemId));
  return result;
}
