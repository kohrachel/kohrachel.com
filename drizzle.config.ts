import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/entities",
  out: "./src/db/migrations",
  dialect: "postgresql",
  // Only manage your app's tables. Supabase owns auth/storage/realtime/vault/etc.
  schemaFilter: ["public"],
  dbCredentials: {
    // Use the session pooler / direct URL (port 5432) for introspection & migrations.
    // The transaction pooler (6543) doesn't support the queries drizzle-kit needs.
    url: process.env.DATABASE_URL!,
  },
});
