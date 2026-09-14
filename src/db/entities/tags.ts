import {
  bigint,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tags = pgTable.withRLS(
  "tags",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity({
      name: "Tags_id_seq",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    name: text(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "Tags_pkey" }),
    unique("Tags_name_key").on(table.name),
    pgPolicy("Enable read access for all users", {
      for: "select",
      using: sql`true`,
    }),
  ],
);
