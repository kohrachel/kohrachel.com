import {
  bigint,
  pgPolicy,
  pgTable,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { posts } from "./posts";
import { tags } from "./tags";

export const postsTags = pgTable.withRLS(
  "posts_tags",
  {
    id: bigint({ mode: "number" }).generatedByDefaultAsIdentity(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    postId: bigint("post_id", { mode: "number" })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagId: bigint("tag_id", { mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.postId, table.tagId],
      name: "posts_tags_pkey",
    }),
    pgPolicy("Enable read access for all users", {
      for: "select",
      using: sql`true`,
    }),
  ],
);
