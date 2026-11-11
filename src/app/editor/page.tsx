import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { GitMergeIcon, GitPullRequestIcon } from "@hugeicons/core-free-icons";
import { listAllPosts } from "@/server/posts/admin";
import { createPost } from "@/server/posts/create";
import { DeletePostButton } from "./delete-post-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, shortDate } from "@/lib/utils";

// Shared by the header row and each post row so the columns line up:
// status icon | title | updated date | delete.
const ROW_GRID =
  "grid grid-cols-[1.25rem_minmax(0,1fr)_auto_auto] items-center gap-4 px-4";

export default function EditorIndexPage() {
  return (
    <div className="px-4 pt-(--page-padding-top) pb-(--page-padding-bottom) sm:px-8 lg:px-16">
      {/* Fills the viewport (minus the top/bottom padding) so the
          heading and column headers stay put and only the list scrolls. */}
      <div className="mx-auto flex h-[calc(100dvh-var(--page-padding-top)-var(--page-padding-bottom))] w-full max-w-5xl flex-col gap-6 rounded-lg bg-stone-900 p-7 sm:p-10">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <h1 className="my-0">Posts</h1>
          {/* A form, not a link: creating a post is a mutation, and a GET route
              would create posts whenever it's prefetched. */}
          <form action={createPost}>
            <Button type="submit" size="lg" className="h-9 px-3 text-sm">
              New post
            </Button>
          </form>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2" data-not-typeset>
          <div
            className={`${ROW_GRID} shrink-0 text-xs font-medium uppercase tracking-wide text-stone-400`}
          >
            <span aria-hidden />
            <span>Title</span>
            <span>Updated</span>
            <span aria-hidden className="w-6" />
          </div>
          <Suspense fallback={<p className="px-4">Loading…</p>}>
            <PostList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function PostList() {
  await connection();
  const posts = await listAllPosts();

  if (posts.length === 0) return <p className="px-4">No posts yet.</p>;

  return (
    <ul className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-0">
      {posts.map((post) => (
        <li
          key={post.id}
          className={cn(
            ROW_GRID,
            "relative m-0 rounded-lg border bg-stone-800 py-3 transition-colors duration-300 has-[a:hover]:bg-accent/70",
            post.isPublished ? "border-primary/40" : "border-stone-700",
          )}
        >
          <StatusIcon isPublished={post.isPublished} />
          <Link
            href={`/editor/${post.id}`}
            className="flex min-w-0 items-center gap-2 text-foreground no-underline after:absolute after:inset-0 after:rounded-lg"
          >
            <span className="truncate">{post.title || "[untitled]"}</span>
            {post.isPublished && post.hasDraft && (
              <span className="hidden shrink-0 rounded-full border border-stone-600 px-2 py-0.5 text-xs text-stone-300 sm:inline">
                Unpublished changes
              </span>
            )}
          </Link>
          <span className="text-sm text-stone-400">
            {shortDate(post.updatedAt)}
          </span>
          <DeletePostButton id={post.id} title={post.title || "[untitled]"} />
        </li>
      ))}
    </ul>
  );
}

function StatusIcon({ isPublished }: { isPublished: boolean }) {
  const label = isPublished ? "Published" : "Draft (unpublished)";
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        aria-label={label}
        className={`relative z-10 flex ${isPublished ? "text-primary" : "text-stone-400"}`}
      >
        <HugeiconsIcon
          icon={isPublished ? GitMergeIcon : GitPullRequestIcon}
          size={18}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
