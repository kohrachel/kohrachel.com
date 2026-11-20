import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./relations";

config({ path: ".env" }); // or .env.local

// One connection per server instance, through Supabase's transaction pooler
// on Vercel. Queries started at the same time (Promise.all) are sent down
// that one connection back to back, which the transaction pooler can leave
// hanging until the statement timeout, so run queries one after another.
const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
export const db = drizzle({ client, relations });
