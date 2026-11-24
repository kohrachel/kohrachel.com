import "server-only";
import { and, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import {
  DISPLAY_NAME_MAX,
  USERNAME_MAX,
  type SetupInput,
} from "@/domain-types/bluebook/auth";
import { hashPassword } from "./password";
import { createSessionService } from "./sessions";
import { hashToken } from "./tokens";

export type SetupLink = {
  needsProfile: boolean;
  suggestedUsername: string;
  suggestedDisplayName: string;
};

export type FinishSetupResult =
  { ok: true; token: string; expiresAt: Date } | { ok: false; error: string };

const EXPIRED = "This link has expired or was already used. Ask for a new one.";

const validLink = (token: string) =>
  and(
    eq(users.setupTokenHash, hashToken(token)),
    gt(users.setupTokenExpiresAt, sql`now()`),
    isNull(users.disabledAt),
  );

/** What the setup page needs for a setup link, or null if the link is no good. */
export async function findSetupLinkService(
  token: string,
): Promise<SetupLink | null> {
  const [user] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(validLink(token));
  if (!user) return null;
  const local = user.email.split("@")[0];
  return {
    needsProfile: user.username === null,
    suggestedUsername: local
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, USERNAME_MAX),
    suggestedDisplayName: local.slice(0, DISPLAY_NAME_MAX),
  };
}

/**
 * Sets the password (and, the first time, the username and display name),
 * uses up the link, signs the user out everywhere else and starts a session
 * here.
 */
export async function finishSetupService(
  token: string,
  input: SetupInput,
): Promise<FinishSetupResult> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(validLink(token))
        .for("update");
      if (!user) return { ok: false, error: EXPIRED };

      const needsProfile = user.username === null;
      if (needsProfile && (!input.username || !input.displayName)) {
        return { ok: false, error: "Pick a username and display name." };
      }
      if (needsProfile && (await usernameTaken(tx, input.username!, user.id))) {
        return { ok: false, error: "That username is taken." };
      }

      await tx
        .update(users)
        .set({
          passwordHash,
          ...(needsProfile
            ? { username: input.username, displayName: input.displayName }
            : {}),
          setupTokenHash: null,
          setupTokenExpiresAt: null,
          failedSignIns: 0,
          lockedUntil: null,
          updatedAt: sql`now()`,
        })
        .where(eq(users.id, user.id));
      await tx.delete(sessions).where(eq(sessions.userId, user.id));
      const session = await createSessionService(user.id, tx);
      return { ok: true, ...session };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "That username is taken." };
    }
    throw error;
  }
}

export async function usernameTaken(
  tx: Pick<typeof db, "select">,
  username: string,
  userId: number,
) {
  const [taken] = await tx
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(sql`lower(${users.username})`, username.toLowerCase()),
        ne(users.id, userId),
      ),
    );
  return !!taken;
}

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}
