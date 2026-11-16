import { z } from "zod";
import { itemTitleSchema, optionalText, publishedAtSchema } from "./add";

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

export type UpdateItemInput = z.input<typeof updateItemSchema>;

export type EditResult =
  { ok: true; itemId: number } | { ok: false; error: string };
