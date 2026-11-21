import { sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { emailSchema, SETUP_LINK_HOURS } from "@/domain-types/bluebook/auth";
import { hashToken, newToken } from "./tokens";

export type InviteResult = {
  token: string;
  created: boolean;
  needsProfile: boolean;
  disabled: boolean;
};

/**
 * Makes a one-time setup link for an email, adding the user if they're new.
 * Any earlier link for them stops working.
 */
export async function inviteService(rawEmail: string): Promise<InviteResult> {
  const email = emailSchema.parse(rawEmail);
  const token = newToken();
  const link = {
    setupTokenHash: hashToken(token),
    setupTokenExpiresAt: sql`now() + make_interval(hours => ${SETUP_LINK_HOURS})`,
  };

  const [row] = await db
    .insert(users)
    .values({ email, ...link })
    .onConflictDoUpdate({
      target: users.email,
      set: { ...link, updatedAt: sql`now()` },
    })
    .returning({
      created: sql<boolean>`xmax = 0`,
      username: users.username,
      disabledAt: users.disabledAt,
    });
  return {
    token,
    created: row.created,
    needsProfile: row.username === null,
    disabled: row.disabledAt !== null,
  };
}
