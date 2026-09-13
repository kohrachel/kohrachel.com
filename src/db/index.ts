import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./entities/relations";

config({ path: ".env" }); // or .env.local

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client, relations });
