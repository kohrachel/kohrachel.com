import {
  bigint,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tags = pgTable.withRLS(
  "tags",
  {
    id: bigint({ mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity({ name: "Tags_id_seq" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    name: text(),
  },
  (table) => [
    unique("Tags_name_key").on(table.name),
    pgPolicy("Enable read access for all users", {
      for: "select",
      using: sql`true`,
    }),
  ],
);
