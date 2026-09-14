import { notFound } from "next/navigation";
import { listPosts } from "@/server/posts/list";
import { renderNode } from "@/services/posts/render";

export default async function SinglePost({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const id = Number(slug);
  const [post] = await listPosts({ postIds: [id] });
  if (!post || !post.content.content) notFound();

  const { title, description } = post;

  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      {post.content.content.map((node, i) => renderNode(node, i))}
    </>
  );
}
