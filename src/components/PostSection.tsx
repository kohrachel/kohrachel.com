import PostWall from "@/components/PostWall";
import { Post } from "@/db/schema";

export default function PostSection({ posts }: { posts: Post[] }) {
  return (
    <section className="flex flex-col md:flex-row">
      <PostWall posts={posts} />
    </section>
  );
}
