import {
  bigint,
  foreignKey,
  index,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bluebook } from "./schema";
import { items } from "./items";
import { entries } from "./entries";

export const mentions = bluebook.table.withRLS(
  "mentions",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    entryId: bigint("entry_id", { mode: "number" }).notNull(),
    targetItemId: bigint("target_item_id", { mode: "number" }).notNull(),
    context: text().default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "mentions_pkey" }),
    foreignKey({
      columns: [table.entryId],
      foreignColumns: [entries.id],
      name: "mentions_entry_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.targetItemId],
      foreignColumns: [items.id],
      name: "mentions_target_item_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("mentions_entry_id_target_item_id_unique").on(
      table.entryId,
      table.targetItemId,
    ),
    index("mentions_target_item_id_idx").on(table.targetItemId),
  ],
);

export type Mention = typeof mentions.$inferSelect;
export type IMention = typeof mentions.$inferInsert;
