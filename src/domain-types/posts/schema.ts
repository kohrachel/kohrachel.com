import { z } from "zod";
import { IPost } from "@/db/entities";

export const upsertPostSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  content: z.custom<IPost["content"]>().optional(),
});

export type UpsertPostInput = z.infer<typeof upsertPostSchema>;
