import PostWall from "@/components/PostWall";
import { Post } from "@/db/schema";

export default function PostSection({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  return (
    <section className={`flex flex-col md:flex-row ${className}`}>
      <PostWall posts={posts} />
    </section>
  );
}
