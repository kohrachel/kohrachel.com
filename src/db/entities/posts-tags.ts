import {
  bigint,
  foreignKey,
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
    postId: bigint("post_id", { mode: "number" }).notNull(),
    tagId: bigint("tag_id", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.postId, table.tagId],
      name: "posts_tags_pkey",
    }),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: "posts_tags_post_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "posts_tags_tag_id_fkey",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    pgPolicy("Enable read access for all users", {
      for: "select",
      using: sql`true`,
    }),
  ],
);
