// Applies supabase/storage-setup.sql to the database in DATABASE_URL.
// See docs/storage-and-auth-plan.md §A2. Idempotent — safe to re-run.
import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { join } from "node:path";

config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (checked .env). Aborting.");
  process.exit(1);
}

const sqlPath = join(process.cwd(), "supabase", "storage-setup.sql");
const sqlText = readFileSync(sqlPath, "utf8");

const sql = postgres(url, { max: 1 });

try {
  await sql.unsafe(sqlText);
  console.log("✓ storage-setup.sql applied to Supabase.");
} catch (err) {
  console.error("✗ Failed to apply storage-setup.sql:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
