import {
  bigint,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";

export const posts = pgTable.withRLS(
  "posts",
  {
    id: bigint({ mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity({ name: "Posts_id_seq" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    title: text(),
    description: text(),
    viewCount: integer("view_count").default(0),
    content: jsonb()
      .$type<JSONContent>()
      .default({ type: "doc", content: [] })
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  () => [
    pgPolicy("Enable insert for authenticated users only", {
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("Enable read access for all users", {
      for: "select",
      using: sql`true`,
    }),
    pgPolicy("Enable update for authenticated users only", {
      for: "update",
      to: ["authenticated"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

// Infer types
export type Post = typeof posts.$inferSelect;
export type IPost = typeof posts.$inferInsert;
