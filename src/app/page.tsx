import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { listPosts } from "@/server/posts/list";

export default async function Home() {
  const posts = await listPosts({});
  return (
    <main className="text-center flex flex-1 flex-col gap-8 px-(--home-padding-inline) pt-(--home-padding-top) pb-(--home-padding-bottom)">
      <Header />
      <PostSection posts={posts} />
    </main>
  );
}
