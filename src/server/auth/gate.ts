// The blog's write gate. See docs/storage-and-auth-plan.md Part B (B2).
// Bluebook has its own gate in src/server/bluebook/auth; never mix the two.
//
// Every blog write server action (DB or storage) MUST call this as its first
// line (invariant J1). Do NOT rely on src/proxy.ts for this — server actions
// are public HTTP endpoints (J3).
//
// `next dev` is always allowed; everywhere else needs the admin session
// cookie set by logging in with ADMIN_SECRET.
import "server-only";
import { hasSession } from "./session";

export async function requireWriteAccess() {
  if (!(await canWrite())) {
    throw new Error("unauthorized");
  }
}

/** Whether this request may write, for pages that show owner-only UI. */
export async function canWrite(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") return true;
  return hasSession();
}
