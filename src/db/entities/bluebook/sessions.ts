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
import { users } from "./users";

export const sessions = bluebook.table.withRLS(
  "sessions",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    tokenHash: text("token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sessions_pkey" }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type ISession = typeof sessions.$inferInsert;
