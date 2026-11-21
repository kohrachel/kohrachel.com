import {
  bigint,
  check,
  integer,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bluebook } from "./schema";

export const userRole = bluebook.enum("user_role", [
  "owner",
  "admin",
  "member",
]);

export const users = bluebook.table.withRLS(
  "users",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    email: text().notNull(),
    username: text(),
    displayName: text("display_name"),
    role: userRole().default("member").notNull(),
    passwordHash: text("password_hash"),
    setupTokenHash: text("setup_token_hash"),
    setupTokenExpiresAt: timestamp("setup_token_expires_at", {
      withTimezone: true,
    }),
    failedSignIns: integer("failed_sign_ins").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "users_pkey" }),
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(sql`lower(${table.username})`),
    uniqueIndex("users_setup_token_hash_unique").on(table.setupTokenHash),
    check(
      "users_email_format_check",
      sql`${table.email} = lower(${table.email}) and ${table.email} ~ '^[^@\\s]+@[^@\\s]+$'`,
    ),
    check(
      "users_username_format_check",
      sql`${table.username} ~ '^[A-Za-z0-9_-]{1,30}$'`,
    ),
    check(
      "users_display_name_not_blank_check",
      sql`btrim(${table.displayName}) <> ''`,
    ),
    check(
      "users_setup_complete_check",
      sql`(${table.username} is null) = (${table.displayName} is null)
        and (${table.username} is null) = (${table.passwordHash} is null)`,
    ),
    check(
      "users_setup_token_check",
      sql`(${table.setupTokenHash} is null) = (${table.setupTokenExpiresAt} is null)`,
    ),
    check("users_failed_sign_ins_check", sql`${table.failedSignIns} >= 0`),
  ],
);

export type User = typeof users.$inferSelect;
export type IUser = typeof users.$inferInsert;
