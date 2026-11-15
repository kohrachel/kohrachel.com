import { mock } from "bun:test";

// `server-only` is resolved by Next.js; outside it, server modules can be
// imported directly in tests.
mock.module("server-only", () => ({}));

// Tests must never reach the real database, which `bun test` would otherwise
// pick up from .env. Database tests run only against TEST_DATABASE_URL, and
// only if it's on this machine; everything else gets an address where
// nothing listens.
const testDatabase = process.env.TEST_DATABASE_URL;
if (testDatabase) {
  const host = new URL(testDatabase).hostname;
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
    throw new Error(`TEST_DATABASE_URL must be local, not ${host}`);
  }
}
process.env.DATABASE_URL =
  testDatabase ?? "postgres://no-test-database@127.0.0.1:1/none";
