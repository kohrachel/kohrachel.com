import { Suspense } from "react";
import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { Books } from "@/components/Books";
import { YouTube } from "@/components/YouTube";
import { QuirkyLine } from "@/components/QuirkyLine";
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
        <QuirkyLine />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ul
          className="bg-stone-900 lg:col-span-4 p-3 font-tiny"
          data-not-typeset
        >
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
          ].map((_, i) => (
            <li
              key={i}
              style={{
                fontVariationSettings: `'wght' ${i * 10 + 20}`,
                letterSpacing: `${i * 0.01}em`,
              }}
              className="leading-5"
            >
              girl makes stuff on the internet
            </li>
          ))}
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28,
          ].map((_, i) => (
            <li
              key={i}
              style={{
                fontVariationSettings: `'wght' ${300 - (i * 10 + 20)}`,
                letterSpacing: `${0.28 - i * 0.01}em`,
              }}
              className="leading-5"
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
