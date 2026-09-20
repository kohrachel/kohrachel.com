import { Suspense } from "react";
import PostSection from "@/components/PostSection";
import Header from "@/components/Header";
import { Books } from "@/components/Books";
import { YouTube } from "@/components/YouTube";
import { QuoteOfTheDay } from "@/components/QuoteOfTheDay";
import { listPosts } from "@/server/posts/list";
import { storage, BUCKETS } from "@/services/storage";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  GraduationScrollIcon,
  LaptopProgrammingIcon,
  MaskTheater02Icon,
  PhysicsIcon,
  BookMarkedIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

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
        <section className="bg-stone-900 lg:col-span-4 p-7 flex flex-col justify-between">
          <div>
            <span className="font-basteleur text-primary">{`about rachel? why?`}</span>
            <ul className="py-5 flex flex-col gap-2 list-none m-0 [&>li]:m-0 [&>li]:p-0 p-0 text-start">
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={GraduationScrollIcon} />
                {`CS, physics, math @ vandy '27`}
              </li>
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={LaptopProgrammingIcon} />
                <span>
                  {`prev: swe intern @`}
                  <Link href="https://trytreater.com/">Treater</Link>
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={MaskTheater02Icon} />
                {`undiagnosed theatre kid`}
              </li>
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={PhysicsIcon} />
                {`i want nuclear fusion so bad`}
              </li>
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={Location01Icon} />
                {`earth, probably`}
              </li>
            </ul>
            <span className="font-basteleur text-primary">{`wdym i have to socialize`}</span>
            <ul className="py-5 flex flex-col gap-2 list-none m-0 [&>li]:m-0 [&>li]:p-0 p-0 text-start">
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={GithubIcon} />
                <Link
                  href="https://github.com/kohrachel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github (@kohrachel)
                </Link>
              </li>
              <li className="flex gap-3 items-center">
                <HugeiconsIcon icon={BookMarkedIcon} />
                <Link
                  href="https://goodreads.com/kohrachel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Goodreads (@kohrachel)
                </Link>
              </li>
            </ul>
          </div>

          <p className="text-sm italic">
            rachel told me to tell you that the world is still{" "}
            <span className="font-basteleur text-primary">beautiful</span>, like
            a dumpster fire of stardust
          </p>
        </section>
        {/* <ul
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
        </ul> */}
        <PostSection posts={posts} className="lg:col-span-8" />
      </div>
      <Books />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <YouTube kodakFrame={kodakFrame} className="lg:col-span-7" />
      </div>
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
