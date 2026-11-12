import { revalidateTag } from "next/cache";
import { Post } from "@/db/schema";

export function postTag(id?: number) {
  return id ? `post-${id}` : "posts";
}

export function postSlugTag(slug: string) {
  return `post-slug-${slug}`;
}

export function revalidatePostTags(row?: Post, previousSlug?: string | null) {
  revalidateTag(postTag(), "max");
  if (row?.id !== undefined) {
    revalidateTag(postTag(row.id), "max");
  }
  for (const slug of new Set([row?.slug, previousSlug])) {
    if (slug) revalidateTag(postSlugTag(slug), "max");
  }
}
