import {
  bigint,
  date,
  foreignKey,
  index,
  jsonb,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { bluebook, datePrecision } from "./schema";
import { items } from "./items";
import { users } from "./users";

export const entries = bluebook.table.withRLS(
  "entries",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    itemId: bigint("item_id", { mode: "number" }).notNull(),
    userId: bigint("user_id", { mode: "number" }),
    consumedOn: date("consumed_on", { mode: "string" }).notNull(),
    consumedPrecision: datePrecision("consumed_precision")
      .default("day")
      .notNull(),
    content: jsonb()
      .$type<JSONContent>()
      .default({ type: "doc", content: [] })
      .notNull(),
    plainText: text("plain_text").default("").notNull(),
    contentEditedAt: timestamp("content_edited_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "entries_pkey" }),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: "entries_item_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "entries_user_id_fkey",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    index("entries_user_id_idx").on(table.userId),
    index("entries_item_id_created_at_idx").on(table.itemId, table.createdAt),
    index("entries_plain_text_search_idx").using("pgroonga", table.plainText),
  ],
);

export type Entry = typeof entries.$inferSelect;
export type IEntry = typeof entries.$inferInsert;
