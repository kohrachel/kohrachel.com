// Bluebook's write gate. See docs/storage-and-auth-plan.md Part B (B3).
// Every bluebook write server action calls `requireMember()` first (J1).
// The blog has its own gate in src/server/auth; never mix the two.
import "server-only";
import { cache } from "react";
import type { CurrentUser } from "@/domain-types/bluebook/auth";
import {
  findDevUserService,
  findSessionUserService,
  refreshSessionService,
} from "@/services/bluebook/auth/sessions";
import { readSessionToken, setSessionCookie } from "./cookie";

/** The user signed in with a session cookie on this device. */
export const sessionUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await readSessionToken();
  return token ? findSessionUserService(token) : null;
});

/**
 * Who's using bluebook. In `next dev` with no session, the owner, or the
 * user named in BLUEBOOK_DEV_USER.
 */
export const currentUser = cache(async (): Promise<CurrentUser | null> => {
  const user = await sessionUser();
  if (user || process.env.NODE_ENV !== "development") return user;
  return findDevUserService(process.env.BLUEBOOK_DEV_USER);
});

/** For server actions: throws unless signed in, and keeps the session alive. */
export async function requireMember(): Promise<CurrentUser> {
  const user = await currentUser();
  if (!user) throw new Error("unauthorized");

  const token = await readSessionToken();
  const expiresAt = token ? await refreshSessionService(token) : null;
  if (token && expiresAt) await setSessionCookie(token, expiresAt);
  return user;
}
