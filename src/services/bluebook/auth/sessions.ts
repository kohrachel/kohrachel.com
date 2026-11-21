import "server-only";
import { and, eq, gt, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { SESSION_DAYS, type CurrentUser } from "@/domain-types/bluebook/auth";
import { hashToken, newToken } from "./tokens";

const sessionEnd = sql`now() + make_interval(days => ${SESSION_DAYS})`;

const currentUserColumns = {
  id: users.id,
  username: users.username,
  displayName: users.displayName,
  role: users.role,
};

const activeUser = and(isNull(users.disabledAt), isNotNull(users.passwordHash));

function toCurrentUser(row: {
  id: number;
  username: string | null;
  displayName: string | null;
  role: "owner" | "member";
}): CurrentUser | null {
  if (row.username === null || row.displayName === null) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    role: row.role,
  };
}

/** Starts a session for a user. Returns the token for the cookie. */
export async function createSessionService(
  userId: number,
  executor: Pick<typeof db, "insert"> = db,
): Promise<{ token: string; expiresAt: Date }> {
  const token = newToken();
  const [session] = await executor
    .insert(sessions)
    .values({ userId, tokenHash: hashToken(token), expiresAt: sessionEnd })
    .returning({ expiresAt: sessions.expiresAt });
  return { token, expiresAt: session.expiresAt };
}

/** The signed-in user for a session token, if the session and user are still good. */
export async function findSessionUserService(
  token: string,
): Promise<CurrentUser | null> {
  const [row] = await db
    .select(currentUserColumns)
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, sql`now()`),
        activeUser,
      ),
    );
  return row ? toCurrentUser(row) : null;
}

/**
 * Pushes a session's expiry out if it hasn't been used in the last day.
 * Returns the new expiry when it moved, so the cookie can move with it.
 */
export async function refreshSessionService(
  token: string,
): Promise<Date | null> {
  const [session] = await db
    .update(sessions)
    .set({ lastUsedAt: sql`now()`, expiresAt: sessionEnd })
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, sql`now()`),
        lt(sessions.lastUsedAt, sql`now() - interval '1 day'`),
      ),
    )
    .returning({ expiresAt: sessions.expiresAt });
  return session?.expiresAt ?? null;
}

export async function deleteSessionService(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

/** A user by username, for acting as someone in `next dev`. Defaults to the owner. */
export async function findDevUserService(
  username: string | undefined,
): Promise<CurrentUser | null> {
  const [row] = await db
    .select(currentUserColumns)
    .from(users)
    .where(
      and(
        activeUser,
        username
          ? eq(sql`lower(${users.username})`, username.toLowerCase())
          : eq(users.role, "owner"),
      ),
    )
    .orderBy(users.id)
    .limit(1);
  return row ? toCurrentUser(row) : null;
}
