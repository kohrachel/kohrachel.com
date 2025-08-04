import Link from "next/link";

export default function Blog() {
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
                latest posts
              </p>
              <ul className="text-sm list-outside list-disc pl-5">
                <li>fresh hot news</li>
                <li>not clickbait!</li>
                <li>you heard it here first</li>
                <li>like okay, but also no</li>
              </ul>
            </div>
            <div>
              <p className="font-serif font-semibold text-lg italic">
                editor&apos;s picks
              </p>
              <ul className="text-sm list-outside list-disc px-5">
                <Link href="" className="w-max">
                  <li className="underline underline-offset-1 hover:underline-offset-2 hover:decoration-purple-500 decoration-purple-200 transition-all duration-700 w-max">
                    coming soon
                  </li>
                </Link>
                <li>when we have enough to pick</li>
                <li>this is going to be so high class</li>
                <li>the world is not ready</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-between"></div>
          </div>
        </div>

        <div className="w-3/5 h-full py-2">
          <div className="flex justify-between w-stretch h-full rounded-lg outline outline-purple-200 bg-white overflow-y-scroll">
            <div className="h-full w-1/2 bg-blue-300">hello</div>
          </div>
        </div>

        <div className="overflow-scroll p-4 h-full w-1/5 flex flex-col">
          <div className="grid grid-cols-1 gap-y-3 h-full w-full overflow-scroll p-1 ">
            {posts.map((post) => (
              <Link href={post.href} key={post.title} className="rounded-xl">
                <div className="flex flex-col justify-between group rounded-xl p-4 h-max outline-2 outline-dashed outline-purple-100 hover:outline-purple-700 hover:bg-purple-200 transition-all duration-700">
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
              </Link>
            ))}
          </div>
          <p className="text-stone-900 text-4xl font-serif font-bold italic pt-4 pb-8 px-2">
            the great list
          </p>
        </div>
      </div>
    </div>
  );
}

const posts: {
  title: string;
  href: string;
  description: string;
  date: string;
  imgPath: string;
}[] = [
  {
    title: "you don't exist",
    href: "/you-dont-exist",
    description: "the book that just saved me that you haven't heard of",
    date: "2024-01-01",
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "blog about a blog",
    href: "/blog-about-a-blog",
    description: "i sense a glitch in the matrix",
    date: "2025-02-18",
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "5 scrapped NYT bestsellers",
    href: "/5-scrapped-nyt-bestsellers",
    description: "sometimes you should get an editor",
    date: "2025-02-18",
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "ete",
    href: "/ete",
    description: "written purely out of self-indulgence",
    date: "2024-01-04",
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "a series of goodbyes",
    href: "/",
    description: "this is not sappy at all",
    date: "2024-01-04",
    imgPath: "/assets/blog/example43.jpg",
  },
  {
    title: "life (is a stained glass window)",
    href: "/",
    description: "and hopefully not in the wcs way",
    date: "2024-01-04",
    imgPath: "/assets/blog/example43.jpg",
  },
];
