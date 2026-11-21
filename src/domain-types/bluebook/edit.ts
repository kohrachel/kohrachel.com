import { z } from "zod";
import {
  DATE_PRECISIONS,
  itemTitleSchema,
  optionalText,
  publishedAtSchema,
} from "./add";

const idSchema = z.number().int().positive();

export const updateItemSchema = z.object({
  id: idSchema,
  title: itemTitleSchema,
  creator: optionalText(300),
  publishedAt: publishedAtSchema,
});

export const setFavoriteSchema = z.object({
  id: idSchema,
  isFavorite: z.boolean(),
});

export const deleteItemSchema = z.object({ id: idSchema });
export const deleteEntrySchema = z.object({ id: idSchema });

const consumed = {
  consumedOn: z.iso.date(),
  consumedPrecision: z.enum(DATE_PRECISIONS),
};
export const updateEntryDateSchema = z.object({ id: idSchema, ...consumed });
export const addEntrySchema = z.object({ itemId: idSchema, ...consumed });

export type EntryDateInput = z.input<typeof addEntrySchema>;

export type UpdateItemInput = z.input<typeof updateItemSchema>;

export type EditResult =
  | {
      ok: true;
      itemId: number;
      /** Other items whose pages show the change. */
      alsoChangedItemIds?: number[];
    }
  | { ok: false; error: string };
