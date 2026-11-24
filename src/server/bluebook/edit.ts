"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import type { CurrentUser } from "@/domain-types/bluebook/auth";
import { requireMember } from "@/server/bluebook/auth/gate";
import {
  addEntrySchema,
  deleteEntrySchema,
  deleteItemSchema,
  setFavoriteSchema,
  updateEntryDateSchema,
  updateItemSchema,
  type EditResult,
  type EntryDateInput,
  type UpdateItemInput,
} from "@/domain-types/bluebook/edit";
import { ITEM_LISTS_TAG, itemTag } from "@/services/bluebook/items/cache-tags";
import {
  addEntryService,
  deleteEntryService,
  deleteItemService,
  setFavoriteService,
  updateEntryDateService,
  updateItemService,
} from "@/services/bluebook/items/edit";

export async function updateItem(input: UpdateItemInput): Promise<EditResult> {
  return edit(updateItemSchema, input, (parsed) => updateItemService(parsed));
}

export async function setFavorite(input: {
  id: number;
  isFavorite: boolean;
}): Promise<EditResult> {
  return edit(setFavoriteSchema, input, ({ id, isFavorite }, actor) =>
    setFavoriteService(actor, id, isFavorite),
  );
}

export async function deleteItem(input: { id: number }): Promise<EditResult> {
  return edit(deleteItemSchema, input, ({ id }, actor) =>
    deleteItemService(actor, id),
  );
}

export async function deleteEntry(input: { id: number }): Promise<EditResult> {
  return edit(deleteEntrySchema, input, ({ id }, actor) =>
    deleteEntryService(actor, id),
  );
}

export async function updateEntryDate(
  input: Omit<EntryDateInput, "itemId"> & { id: number },
): Promise<EditResult> {
  return edit(updateEntryDateSchema, input, (parsed, actor) =>
    updateEntryDateService(actor, parsed),
  );
}

export async function addEntry(input: EntryDateInput): Promise<EditResult> {
  return edit(addEntrySchema, input, (parsed, actor) =>
    addEntryService(actor, parsed),
  );
}

/** Checks write access and the input, runs the change, and refreshes the item's page and item lists. */
async function edit<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  run: (parsed: z.output<Schema>, actor: CurrentUser) => Promise<EditResult>,
): Promise<EditResult> {
  const actor = await requireMember();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const result = await run(parsed.data, actor);
  if (result.ok) {
    for (const id of [result.itemId, ...(result.alsoChangedItemIds ?? [])]) {
      updateTag(itemTag(id));
    }
    updateTag(ITEM_LISTS_TAG);
  }
  return result;
}
