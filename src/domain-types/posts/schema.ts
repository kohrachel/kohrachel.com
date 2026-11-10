import { z } from "zod";
import { IPost } from "@/db/schema";

// What the editor can change. `.strict()` rejects anything else, so a new
// editable field has to be added here on purpose.
// - title/description/content edit the draft; the live post is untouched.
// - isPublished: true promotes the draft to live; false hides the post.
export const postPatchSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    content: z.custom<IPost["content"]>(),
    isPublished: z.boolean(),
  })
  .partial()
  .strict();

export const updatePostSchema = z.object({
  id: z.number().int().positive(),
  patch: postPatchSchema,
});

export const postIdSchema = z.number().int().positive();

export type PostPatch = z.infer<typeof postPatchSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
