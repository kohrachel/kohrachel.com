import {
  bigint,
  boolean,
  check,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bluebook } from "./schema";

export const items = bluebook.table.withRLS(
  "items",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    url: text().notNull(),
    normalizedUrl: text("normalized_url").notNull(),
    platform: text()
      .notNull()
      .generatedAlwaysAs(
        sql`regexp_replace(substring(normalized_url from '^https://([^/?#:]+)'), '^www\\.', '')`,
      ),
    title: text().notNull(),
    creator: text(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metadata: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "items_pkey" }),
    uniqueIndex("items_normalized_url_unique").on(table.normalizedUrl),
    check("items_title_not_blank_check", sql`btrim(${table.title}) <> ''`),
    check(
      "items_normalized_url_format_check",
      sql`${table.normalizedUrl} ~ '^https://[a-z0-9.-]+(:[0-9]+)?/'`,
    ),
  ],
);

export type Item = typeof items.$inferSelect;
export type IItem = typeof items.$inferInsert;
