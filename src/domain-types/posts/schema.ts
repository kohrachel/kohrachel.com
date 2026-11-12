import { z } from "zod";
import type { IPost, Post } from "@/db/schema";

// Fields the editor is allowed to change. `.strict()` rejects anything else,
// so a new editable field has to be added here on purpose.
export const postPatchSchema = z
  .object({
    title: z.string(),
    slug: z.string().nullable(),
    description: z.string(),
    content: z.custom<IPost["content"]>(),
    isPublished: z.boolean(),
    deletedAt: z.date(),
  })
  .partial()
  .strict();

export const updatePostSchema = z.object({
  id: z.number().int().positive(),
  patch: postPatchSchema,
});

export const postIdSchema = z.number().int().positive();

export type PostPatch = z.infer<typeof postPatchSchema>;
export type UpdatePostResult = { post: Post } | { error: string };
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
