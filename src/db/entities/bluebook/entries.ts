import {
  bigint,
  date,
  foreignKey,
  index,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bluebook, datePrecision } from "./schema";
import { items } from "./items";

export const entries = bluebook.table.withRLS(
  "entries",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    itemId: bigint("item_id", { mode: "number" }).notNull(),
    consumedOn: date("consumed_on", { mode: "string" }).notNull(),
    consumedPrecision: datePrecision("consumed_precision")
      .default("day")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
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
    index("entries_item_id_created_at_idx").on(table.itemId, table.createdAt),
  ],
);

export type Entry = typeof entries.$inferSelect;
export type IEntry = typeof entries.$inferInsert;
