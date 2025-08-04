"use client";
import Link from "next/link";
import SinglePost from "@/components/SinglePost";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { posts, postType } from "./data";

export default function BlogList() {
  const params = useSearchParams();
  const [activePost, setActivePost] = useState<postType>(() => {
    const sentData = params.get("index");

    return sentData ? posts[Number(sentData)] : posts[0];
  });
  return (
    <div className="h-screen w-screen flex">
      <div className="m-4 w-full h-stretch flex rounded-xl bg-purple-100 outline outline-purple-200 shadow-xl shadow-black/30">
        <div className="w-1/5 h-full flex justify-between px-8 py-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="text-stone-900 text-4xl font-serif font-bold italic">
                rachel&apos;s ramblings
              </p>
              <p className="text-stone-900 text-sm">
                screaming into the void (and to you, I guess)
              </p>
            </div>
            <hr className="bg-purple-300 h-0.5 w-2/3"></hr>

            <div>
              <p className="font-serif font-semibold text-lg italic">
                editor&apos;s picks
              </p>
              <ul className="text-sm list-outside list-disc pl-5 flex flex-col">
                {posts.map(
                  (post, index) =>
                    index < 4 && (
                      <button key={index} onClick={() => setActivePost(post)}>
                        <li className="underline underline-offset-1 hover:underline-offset-2 hover:decoration-purple-500 decoration-purple-100 transition-all duration-700 w-max text-stone-900">
                          {post.title}
                        </li>
                      </button>
                    )
                )}
              </ul>
            </div>
            <Link href="/" className="absolute bottom-11">
              <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 outline outline-purple-100 hover:outline-dashed hover:outline-purple-700 text-purple-800 font-medium rounded-lg transition-all duration-300">
                ← go home
              </button>
            </Link>
            <div className="flex gap-2 justify-between"></div>
          </div>
        </div>

        <div className="w-3/5 h-full py-2">
          <div className="flex justify-between w-stretch h-full rounded-lg outline outline-purple-200 bg-white overflow-y-scroll">
            <div className="h-full w-full">
              <SinglePost post={activePost} />
            </div>
          </div>
        </div>

        <div className="overflow-scroll p-4 h-full w-1/5 flex flex-col">
          <div className="grid grid-cols-1 gap-y-3 h-full w-full overflow-scroll p-1 ">
            {posts.map((post) => (
              <button
                key={post.title}
                className="rounded-xl"
                onClick={() => setActivePost(post)}
              >
                <div className="group rounded-xl p-4 h-max outline-2 outline-dashed outline-purple-100 hover:outline-purple-700 hover:bg-purple-200 transition-all duration-700">
                  <div className="flex flex-col gap-1">
                    <p className="text-stone-900 text-3xl group-hover:text-stone-500 font-serif font-bold italic transition-all duration-300">
                      {post.title}
                    </p>
                    <p className="text-stone-900 text-xs group-hover:text-md transition-all duration-300">
                      {post.description}
                    </p>
                    <p className="text-xs uppercase text-stone-500">
                      {post.date}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
