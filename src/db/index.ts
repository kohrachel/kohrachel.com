import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";

config({ path: ".env" }); // or .env.local

// On Vercel this connects through Supabase's transaction pooler. By default
// postgres.js sends a query down a connection that's still busy with another
// (pipelining), and the transaction pooler leaves such queries hanging until
// the statement timeout, blocking every later query on that connection.
// `max_pipeline: 0` makes queries wait for a free connection instead. It's
// a real option (see postgres.js's defaults) missing from its types, hence
// the variable rather than an inline object.
const options = { max: 1, prepare: false, max_pipeline: 0 };
const client = postgres(process.env.DATABASE_URL!, options);
export const db = drizzle({ client, relations });
