import { mock } from "bun:test";

// `server-only` is resolved by Next.js; outside it, server modules can be
// imported directly in tests.
mock.module("server-only", () => ({}));
