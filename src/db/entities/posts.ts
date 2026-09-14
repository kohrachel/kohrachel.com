import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";

export const posts = pgTable.withRLS(
  "posts",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity({
      name: "Posts_id_seq",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    title: text().default("").notNull(),
    description: text().default("").notNull(),
    viewCount: integer("view_count").default(0),
    isPublished: boolean("is_published").default(false).notNull(),
    content: jsonb()
      .$type<JSONContent>()
      .default({ type: "doc", content: [] })
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "Posts_pkey" }),
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
