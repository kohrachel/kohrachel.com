import {
  bigint,
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";

export type PostDraft = {
  title: string;
  slug: string | null;
  description: string;
  content: JSONContent;
};

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
    slug: text(),
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
    draft: jsonb().$type<PostDraft>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  // RLS is enabled (via withRLS) with NO policies -> default-deny for the
  // Supabase anon/authenticated roles that back the auto-generated Data API.
  // The app is unaffected: it connects as the table owner over DATABASE_URL,
  // which bypasses RLS. This is portable standard Postgres (no Supabase roles).
  (table) => [
    primaryKey({ columns: [table.id], name: "Posts_pkey" }),
    uniqueIndex("posts_slug_unique")
      .on(table.slug)
      .where(sql`${table.deletedAt} is null`),
    check(
      "posts_slug_format_check",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${table.slug} !~ '^[0-9]+$'`,
    ),
    check("posts_slug_reserved_check", sql`${table.slug} not in ('editor')`),
    check(
      "posts_published_has_slug_check",
      sql`not ${table.isPublished} or ${table.slug} is not null`,
    ),
    check(
      "posts_draft_slug_format_check",
      sql`${table.draft} ->> 'slug' ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${table.draft} ->> 'slug' !~ '^[0-9]+$'`,
    ),
    check(
      "posts_draft_slug_reserved_check",
      sql`${table.draft} ->> 'slug' not in ('editor')`,
    ),
  ],
);

// Infer types
export type Post = typeof posts.$inferSelect;
export type IPost = typeof posts.$inferInsert;
export type PublicPost = Omit<Post, "draft">;
