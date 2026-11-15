// Single write-access gate. See docs/storage-and-auth-plan.md Part B.
//
// Every write server action (DB or storage) MUST call this as its first line
// (invariant J1). Keeping the gate in one helper means Phase 2 -> real auth
// is a one-file change (J2). Do NOT rely on src/proxy.ts for this — server
// actions are public HTTP endpoints (J3).
//
// Phase 2 (current): `next dev` is always allowed; everywhere else needs the
// admin session cookie set by logging in with ADMIN_SECRET.
import "server-only";
import { hasSession } from "./session";

export async function requireWriteAccess() {
  if (process.env.NODE_ENV === "development") return;
  if (!(await hasSession())) {
    throw new Error("unauthorized");
  }
}
