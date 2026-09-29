import { Suspense } from "react";
import { notFound } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderNode } from "@/services/posts/render";
import { humanDate } from "@/lib/utils";

export default function SinglePost({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <PostContent params={params} />
    </Suspense>
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
      {/* Header — full-bleed halftone cloud banner; height tracks the image. */}
      <header
        className="relative left-1/2 h-[33vw] min-h-[22rem] w-screen -translate-x-1/2 sm:min-h-[34rem]"
        data-not-typeset
      >
        <img
          src="/clouds-halftone.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {/* Title sits over the dark sky in the upper area. */}
        <div className="absolute inset-0 flex flex-col items-center justify-start gap-1 overflow-hidden px-6 pt-20 text-center text-[#f5f2e8]">
          <h1 className="mt-0! mb-0! font-heading text-[clamp(1.6rem,6vw,4.5rem)]! leading-tight text-primary">
            {title}
          </h1>
          {description && (
            <span className="font-sans italic text-[clamp(1rem,2.6vw,1.6rem)]">
              {description}
            </span>
          )}
          <span className="font-sans text-[clamp(0.8rem,1.8vw,1.15rem)]">
            {humanDate(createdAt)}
          </span>
        </div>
      </header>

      {/* Body — the journal page */}
      <div className="relative">
        <div className="absolute -inset-x-14 -inset-y-8 -z-10 rounded-lg bg-stone-900" />
        {post.content.content.map((node, i) => renderNode(node, i))}
      </div>
    </>
  );
}
