import { config } from "dotenv";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations";

config({ path: ".env" }); // or .env.local

// On Vercel this connects through Supabase's transaction pooler, which needs
// each connection to run one query at a time. `pg` never sends a query down
// a connection that's still busy (postgres.js did, and the pooler hung), so
// extra queries wait for a free connection. One pool per server instance,
// shared by its concurrent requests; idle connections close after 5 s, and
// `attachDatabasePool` closes them before Vercel suspends the instance.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 5000,
});
attachDatabasePool(pool);

export const db = drizzle({ client: pool, relations });
