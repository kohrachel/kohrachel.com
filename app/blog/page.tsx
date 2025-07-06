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

        <div className="w-4/5 h-full p-2">
          <div className="flex flex-col justify-between w-stretch h-full px-24 py-16 rounded-lg outline outline-purple-200 bg-white overflow-y-scroll">
            <div className="grid grid-cols-2 gap-x-12 gap-y-9">
              {posts.map((post) => (
                <Link href="" key={post.title} className="rounded-2xl">
                  <div className="flex flex-col relative justify-between group rounded-2xl h-max m-1 outline outline-purple-200 outline-offset-4 hover:outline-purple-400 transition-all duration-500">
                    <div className="absolute text-xs uppercase top-2 left-2 text-stone-500">
                      {post.date}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 backdrop-blur-md pl-3 py-2 pr-11 rounded-b-2xl border-solid border-purple-50 border-t-[1px] border-opacity-20">
                      <p className="text-3xl group-hover:text-purple-800 font-serif font-bold italic transition-all duration-300">
                        {post.title}
                      </p>
                      <p className="text-stone-900 text-sm group-hover:text-md transition-all duration-300">
                        {post.description}
                      </p>
                    </div>
                    <img src={post.imgPath} className="rounded-2xl" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
    imgPath: "/assets/you-dont-exist.png",
  },
  {
    title: "blog about a blog",
    href: "/blog-about-a-blog",
    description: "i sense a glitch in the matrix",
    date: "2025-02-18",
    imgPath: "/assets/you-dont-exist.png",
  },
  {
    title: "5 scrapped NYT bestsellers",
    href: "/5-scrapped-nyt-bestsellers",
    description: "sometimes you should get an editor",
    date: "2025-02-18",
    imgPath: "/assets/example43.jpg",
  },
  {
    title: "ete",
    href: "/ete",
    description: "written purely out of self-indulgence",
    date: "2024-01-04",
    imgPath: "/assets/example43.jpg",
  },
  {
    title: "a series of goodbyes",
    href: "/",
    description: "this is not sappy at all",
    date: "2024-01-04",
    imgPath: "/assets/example43.jpg",
  },
  {
    title: "life (is a stained glass window)",
    href: "/",
    description: "and hopefully not in the wcs way",
    date: "2024-01-04",
    imgPath: "/assets/example43.jpg",
  },
];
