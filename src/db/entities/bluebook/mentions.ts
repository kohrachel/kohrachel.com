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
import { reviews } from "./reviews";

export const mentions = bluebook.table.withRLS(
  "mentions",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    reviewId: bigint("review_id", { mode: "number" }).notNull(),
    targetItemId: bigint("target_item_id", { mode: "number" }).notNull(),
    context: text().default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "mentions_pkey" }),
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [reviews.id],
      name: "mentions_review_id_fkey",
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
    uniqueIndex("mentions_review_id_target_item_id_unique").on(
      table.reviewId,
      table.targetItemId,
    ),
    index("mentions_target_item_id_idx").on(table.targetItemId),
  ],
);

export type Mention = typeof mentions.$inferSelect;
export type IMention = typeof mentions.$inferInsert;
