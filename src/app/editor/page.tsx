import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { listAllPosts } from "@/server/posts/admin";
import { createPost } from "@/server/posts/create";
import { Button } from "@/components/ui/button";
import { humanDate } from "@/lib/utils";

export default function EditorIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-measure flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="my-0">Posts</h1>
        {/* A form, not a link: creating a post is a mutation, and a GET route
            would create posts whenever it's prefetched. */}
        <form action={createPost}>
          <Button type="submit" variant="outline" size="lg">
            New post
          </Button>
        </form>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <PostList />
      </Suspense>
    </div>
  );
}

async function PostList() {
  await connection();
  const posts = await listAllPosts();

  if (posts.length === 0) return <p>No posts yet.</p>;

  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0" data-not-typeset>
      {posts.map((post) => (
        <li key={post.id} className="m-0">
          <Link
            href={`/editor/${post.id}`}
            className="flex items-center justify-between gap-4 no-underline"
          >
            <span className="truncate">{post.title || "[untitled]"}</span>
            <span className="shrink-0 text-sm">
              {post.isPublished ? "Published" : "Unpublished"} · Updated{" "}
              {humanDate(post.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
