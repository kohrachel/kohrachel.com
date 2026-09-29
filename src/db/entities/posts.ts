import {
  bigint,
  boolean,
  integer,
  jsonb,
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
  // RLS is enabled (via withRLS) with NO policies -> default-deny for the
  // Supabase anon/authenticated roles that back the auto-generated Data API.
  // The app is unaffected: it connects as the table owner over DATABASE_URL,
  // which bypasses RLS. This is portable standard Postgres (no Supabase roles).
  (table) => [primaryKey({ columns: [table.id], name: "Posts_pkey" })],
);

// Infer types
export type Post = typeof posts.$inferSelect;
export type IPost = typeof posts.$inferInsert;
