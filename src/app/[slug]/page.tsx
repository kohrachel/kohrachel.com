import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderNode } from "@/services/posts/render";
import { humanDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export default function SinglePost({ params }: PageProps<"/[slug]">) {
  return (
    <>
      <div className="flex justify-start">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "link" }), "px-0")}
        >
          ← Back
        </Link>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <PostContent params={params} />
      </Suspense>
    </>
  );
}

async function PostContent({
  params,
}: {
  params: PageProps<"/[slug]">["params"];
}) {
  const { slug } = await params;
  const id = Number(slug);
  const [post] = await listPosts({ postIds: [id] });
  if (!post || !post.content.content) notFound();

  const { title, description, createdAt } = post;

  return (
    <>
      <h1 className="mt-0!">{title}</h1>
      <p className="flex flex-col">
        <span className="italic ">{description}</span>
        <span className="text-sm">{humanDate(createdAt)}</span>
      </p>
      {post.content.content.map((node, i) => renderNode(node, i))}
    </>
  );
}
