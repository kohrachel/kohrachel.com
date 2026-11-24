import "server-only";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { entries, sessions, users } from "@/db/schema";
import type {
  ChangePasswordInput,
  ProfileInput,
  UsernameCheck,
} from "@/domain-types/bluebook/auth";
import { hashPassword, verifyPassword } from "./password";
import { isUniqueViolation, usernameTaken } from "./setup";
import { hashToken } from "./tokens";

export type UpdateProfileResult =
  { ok: true; signedItemIds: number[] } | { ok: false; error: string };

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

const TAKEN = "That username is taken.";

/**
 * Changes a user's username and display name. `signedItemIds` are the items
 * whose pages show the old display name, when it changed.
 */
export async function updateProfileService(
  userId: number,
  input: ProfileInput,
): Promise<UpdateProfileResult> {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ displayName: users.displayName })
        .from(users)
        .where(eq(users.id, userId))
        .for("update");
      if (!user) return { ok: false, error: "That account is gone." };
      if (await usernameTaken(tx, input.username, userId)) {
        return { ok: false, error: TAKEN };
      }

      await tx
        .update(users)
        .set({
          username: input.username,
          displayName: input.displayName,
          updatedAt: sql`now()`,
        })
        .where(eq(users.id, userId));

      const signed =
        user.displayName === input.displayName
          ? []
          : await tx
              .selectDistinct({ itemId: entries.itemId })
              .from(entries)
              .where(eq(entries.userId, userId));
      return { ok: true, signedItemIds: signed.map((row) => row.itemId) };
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: TAKEN };
    throw error;
  }
}

/** Whether `username` is free for `userId`; their own username counts as free. */
export async function usernameAvailableService(
  userId: number,
  username: string,
): Promise<UsernameCheck> {
  return (await usernameTaken(db, username, userId))
    ? { available: false, error: TAKEN }
    : { available: true };
}

/**
 * Sets a new password once the current one checks out, and signs the user
 * out everywhere except the session with `keepToken`.
 */
export async function changePasswordService(
  userId: number,
  input: Pick<ChangePasswordInput, "currentPassword" | "password">,
  keepToken: string | null,
): Promise<ChangePasswordResult> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId));
  if (
    !user?.passwordHash ||
    !(await verifyPassword(input.currentPassword, user.passwordHash))
  ) {
    return { ok: false, error: "That's not your current password." };
  }

  const passwordHash = await hashPassword(input.password);
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        failedSignIns: 0,
        lockedUntil: null,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, userId));
    await tx
      .delete(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          keepToken ? ne(sessions.tokenHash, hashToken(keepToken)) : undefined,
        ),
      );
  });
  return { ok: true };
}
