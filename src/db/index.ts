import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";

config({ path: ".env" }); // or .env.local

// On Vercel this connects through Supabase's transaction pooler, which
// can't handle a query sent down a connection that's still busy with another
// (postgres.js "pipelining"): the query hangs until the 2-minute statement
// timeout, and everything queued behind it with it. With several connections
// per server, simultaneous queries each get their own, and pipelining only
// happens if all are busy. (`max_pipeline: 0` would forbid it outright, but
// breaks transactions in postgres.js.) Idle connections close after 20 s so
// servers don't hold pooler slots they aren't using.
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  prepare: false,
  idle_timeout: 20,
});
export const db = drizzle({ client, relations });
