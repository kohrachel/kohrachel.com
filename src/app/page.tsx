import { Suspense } from "react";
import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { Books } from "@/components/Books";
import { YouTube } from "@/components/YouTube";
import { QuoteOfTheDay } from "@/components/QuoteOfTheDay";
import { listPosts } from "@/server/posts/list";
import { storage, BUCKETS } from "@/services/storage";

export default async function Home() {
  const posts = await listPosts({});
  const headerBackground = storage.getPublicUrl(
    BUCKETS.resources,
    "header-background.png",
  );
  const headerForeground = storage.getPublicUrl(
    BUCKETS.resources,
    "header-foreground.png",
  );
  const kodakFrame = storage.getPublicUrl(
    BUCKETS.resources,
    "kodak-frame-1.png",
  );
  return (
    <main className="text-center flex flex-col items-center gap-8 px-(--home-padding-inline) pt-(--home-padding-top) pb-(--home-padding-bottom)">
      <Header background={headerBackground} foreground={headerForeground} />
      <Suspense>
        <QuoteOfTheDay />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ul
          className="bg-stone-900 lg:col-span-4 p-3 font-tiny list-none m-0 [&>li]:m-0 [&>li]:p-0"
          data-not-typeset
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <li
              key={i}
              className="leading-5"
              style={{
                // Stagger each line so the weight wave travels down the list,
                // looping forever.
                animation: "tinyWeightWave 4s ease-in-out infinite",
                animationDelay: `${-(i * (4 / 30))}s`,
              }}
            >
              girl makes stuff on the internet
            </li>
          ))}
        </ul>
        <PostSection posts={posts} className="lg:col-span-8" />
      </div>
      <Books />
      <YouTube kodakFrame={kodakFrame} />
    </main>
  );
}

export function About() {
  return (
    <article className="lg:col-span-4 bg-stone-900 p-4">
      <ul>
        <li>computer science</li>
        <li>mathematics</li>
        <li>physics</li>
        <li>history</li>
      </ul>
    </article>
  );
}
