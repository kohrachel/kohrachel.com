// Single write-access gate. See docs/storage-and-auth-plan.md Part B.
//
// Every write server action (DB or storage) MUST call this as its first line
// (invariant J1). Keeping the gate in one helper means Phase 1 -> Phase 2
// (shared secret / requireAdmin) -> real auth is a one-file change (J2).
//
// Phase 1 (current): dev-mode gate. Real "secret" is possession of the repo +
// ability to run `next dev`. Do NOT rely on middleware (src/proxy.ts) for this
// — server actions are public HTTP endpoints (J3).
export function requireWriteAccess() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("unauthorized");
  }
}
