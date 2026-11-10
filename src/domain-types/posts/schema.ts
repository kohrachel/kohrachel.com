import { z } from "zod";
import { IPost } from "@/db/schema";

// Fields the editor is allowed to change. `.strict()` rejects anything else,
// so a new editable field has to be added here on purpose.
export const postPatchSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    content: z.custom<IPost["content"]>(),
  })
  .partial()
  .strict();

export const updatePostSchema = z.object({
  id: z.number().int().positive(),
  patch: postPatchSchema,
});

export type PostPatch = z.infer<typeof postPatchSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// Legacy: used by `savePost` until the editor switches to `updatePost`.
export const upsertPostSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.custom<IPost["content"]>().optional(),
});

export type UpsertPostInput = z.infer<typeof upsertPostSchema>;
