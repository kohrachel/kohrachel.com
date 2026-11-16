"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import { requireWriteAccess } from "@/server/auth/gate";
import {
  deleteEntrySchema,
  deleteItemSchema,
  setFavoriteSchema,
  updateItemSchema,
  type EditResult,
  type UpdateItemInput,
} from "@/domain-types/bluebook/edit";
import { itemTag } from "@/services/bluebook/items/cache-tags";
import {
  deleteEntryService,
  deleteItemService,
  setFavoriteService,
  updateItemService,
} from "@/services/bluebook/items/edit";

export async function updateItem(input: UpdateItemInput): Promise<EditResult> {
  return edit(updateItemSchema, input, updateItemService);
}

export async function setFavorite(input: {
  id: number;
  isFavorite: boolean;
}): Promise<EditResult> {
  return edit(setFavoriteSchema, input, ({ id, isFavorite }) =>
    setFavoriteService(id, isFavorite),
  );
}

export async function deleteItem(input: { id: number }): Promise<EditResult> {
  return edit(deleteItemSchema, input, ({ id }) => deleteItemService(id));
}

export async function deleteEntry(input: { id: number }): Promise<EditResult> {
  return edit(deleteEntrySchema, input, ({ id }) => deleteEntryService(id));
}

/** Checks write access and the input, runs the change, and refreshes the item's page. */
async function edit<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  run: (parsed: z.output<Schema>) => Promise<EditResult>,
): Promise<EditResult> {
  await requireWriteAccess();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const result = await run(parsed.data);
  if (result.ok) updateTag(itemTag(result.itemId));
  return result;
}
