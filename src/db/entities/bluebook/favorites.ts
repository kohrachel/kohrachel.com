import {
  bigint,
  foreignKey,
  index,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bluebook } from "./schema";
import { items } from "./items";
import { users } from "./users";

export const favorites = bluebook.table.withRLS(
  "favorites",
  {
    userId: bigint("user_id", { mode: "number" }).notNull(),
    itemId: bigint("item_id", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.itemId],
      name: "favorites_pkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "favorites_user_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: "favorites_item_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("favorites_item_id_idx").on(table.itemId),
  ],
);

export type Favorite = typeof favorites.$inferSelect;
