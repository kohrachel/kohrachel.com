import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  posts: {
    tags: r.many.tags({
      from: r.posts.id.through(r.postsTags.postId),
      to: r.tags.id.through(r.postsTags.tagId),
    }),
  },
  tags: {
    posts: r.many.posts(),
  },
  items: {
    entries: r.many.entries(),
    mentionedIn: r.many.mentions({
      from: r.items.id,
      to: r.mentions.targetItemId,
    }),
  },
  entries: {
    item: r.one.items({
      from: r.entries.itemId,
      to: r.items.id,
      optional: false,
    }),
    review: r.one.reviews({ from: r.entries.id, to: r.reviews.entryId }),
  },
  reviews: {
    entry: r.one.entries({
      from: r.reviews.entryId,
      to: r.entries.id,
      optional: false,
    }),
    mentions: r.many.mentions({ from: r.reviews.id, to: r.mentions.reviewId }),
  },
  mentions: {
    target: r.one.items({
      from: r.mentions.targetItemId,
      to: r.items.id,
      optional: false,
    }),
    review: r.one.reviews({
      from: r.mentions.reviewId,
      to: r.reviews.id,
      optional: false,
    }),
  },
}));
