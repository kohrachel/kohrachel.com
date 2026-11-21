import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  LOCK_MINUTES,
  MAX_FAILED_SIGN_INS,
} from "@/domain-types/bluebook/auth";
import {
  hashPassword,
  needsRehash,
  verifyPassword,
  wasteTime,
} from "./password";

export type SignInResult = { ok: true; userId: number } | { ok: false };

/**
 * Checks a username or email and password. Every failure looks the same to
 * the caller, and takes about as long as a real check.
 */
export async function signInService(
  login: string,
  password: string,
): Promise<SignInResult> {
  const normalized = login.trim().toLowerCase();
  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      disabled: sql<boolean>`${users.disabledAt} is not null`,
      locked: sql<boolean>`coalesce(${users.lockedUntil} > now(), false)`,
    })
    .from(users)
    .where(
      normalized.includes("@")
        ? eq(users.email, normalized)
        : eq(sql`lower(${users.username})`, normalized),
    );

  if (!user?.passwordHash || user.disabled || user.locked) {
    return { ok: await wasteTime(password) };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    await db
      .update(users)
      .set({
        failedSignIns: sql`case when ${users.failedSignIns} + 1 >= ${MAX_FAILED_SIGN_INS} then 0 else ${users.failedSignIns} + 1 end`,
        lockedUntil: sql`case when ${users.failedSignIns} + 1 >= ${MAX_FAILED_SIGN_INS} then now() + make_interval(mins => ${LOCK_MINUTES}) else ${users.lockedUntil} end`,
      })
      .where(eq(users.id, user.id));
    return { ok: false };
  }

  await db
    .update(users)
    .set({
      failedSignIns: 0,
      lockedUntil: null,
      ...(needsRehash(user.passwordHash)
        ? { passwordHash: await hashPassword(password), updatedAt: sql`now()` }
        : {}),
    })
    .where(eq(users.id, user.id));
  return { ok: true, userId: user.id };
}
