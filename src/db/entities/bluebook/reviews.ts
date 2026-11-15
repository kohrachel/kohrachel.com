import {
  bigint,
  foreignKey,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { bluebook } from "./schema";
import { entries } from "./entries";

export const reviews = bluebook.table.withRLS(
  "reviews",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    entryId: bigint("entry_id", { mode: "number" }).notNull(),
    content: jsonb()
      .$type<JSONContent>()
      .default({ type: "doc", content: [] })
      .notNull(),
    plainText: text("plain_text").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "reviews_pkey" }),
    foreignKey({
      columns: [table.entryId],
      foreignColumns: [entries.id],
      name: "reviews_entry_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("reviews_entry_id_unique").on(table.entryId),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type IReview = typeof reviews.$inferInsert;
