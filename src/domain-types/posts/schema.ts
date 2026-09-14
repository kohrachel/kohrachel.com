import { z } from "zod";
import { IPost } from "@/db/schema";

export const upsertPostSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.custom<IPost["content"]>().optional(),
});

export type UpsertPostInput = z.infer<typeof upsertPostSchema>;
