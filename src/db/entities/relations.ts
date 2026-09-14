import { defineRelations } from "drizzle-orm";
import * as schema from "./index";

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
}));
