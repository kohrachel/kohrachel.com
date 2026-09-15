import PostSection from "@/components/PostSection";
import { listPosts } from "@/server/posts/list";

export default async function Home() {
  const posts = await listPosts({});
  return (
    <main className="text-center flex flex-1 flex-col px-(--home-padding-inline) pt-(--home-padding-top) pb-(--home-padding-bottom)">
      <h1>rachel koh</h1>
      <PostSection posts={posts} />
    </main>
  );
}
