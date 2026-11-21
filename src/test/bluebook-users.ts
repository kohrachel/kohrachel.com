import { sql } from "drizzle-orm";
import type { db as Db } from "@/db";

export const OWNER = { id: 1, role: "owner" as const };
export const ADMIN = { id: 2, role: "admin" as const };
export const MEMBER = { id: 3, role: "member" as const };

/**
 * Empties bluebook (users and everything that hangs off them, items and
 * everything that hangs off those) and adds an owner (1), an admin (2) and
 * a member (3) who have finished setup.
 */
export async function resetBluebook(db: typeof Db) {
  await db.execute(
    sql`truncate bluebook.users, bluebook.items restart identity cascade`,
  );
  await db.execute(sql`
    insert into bluebook.users (email, username, display_name, password_hash, role) values
      ('owner@example.com', 'owner', 'Owner', 'x', 'owner'),
      ('admin@example.com', 'admin', 'Admin', 'x', 'admin'),
      ('member@example.com', 'member', 'Member', 'x', 'member')`);
}
