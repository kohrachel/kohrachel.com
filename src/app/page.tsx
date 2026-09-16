import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { listPosts } from "@/server/posts/list";

export default async function Home() {
  const posts = await listPosts({});
  return (
    <main className="text-center flex flex-1 flex-col gap-8 px-(--home-padding-inline) pt-(--home-padding-top) pb-(--home-padding-bottom)">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="grid grid-cols-2 lg:col-span-4 lg:grid-cols-subgrid gap-6">
          <article className="lg:col-span-4 bg-blue-500">
            thinks about 1
          </article>
          <MusicArticle />
        </div>

        {/* Right Column Group: Takes the remaining 8 columns */}
        <PostSection posts={posts} className="lg:col-span-8" />
      </div>
    </main>
  );
}

export function MusicArticle() {
  return (
    <article className="lg:col-span-4 bg-stone-200 px-4 pt-5 pb-12">
      <div className="bg-stone-900 w-full h-full">hello</div>
    </article>
  );
}
