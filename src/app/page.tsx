import PostText from "@/components/PostText";
import { listPosts } from "@/server/posts/list";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleIcon } from "@hugeicons/core-free-icons";

export default async function Home() {
  const posts = await listPosts({});

  return (
    <main>
      <h1>Posts</h1>
      <ul className="max-w-full text-center">
        {posts.map(({ id, title, description }, index) => (
          <li key={id} className="inline">
            <PostText id={id} title={title} description={description} />
            {index !== posts.length - 1 && (
              <span className="inline-flex items-center align-middle mx-2">
                <HugeiconsIcon
                  icon={CircleIcon}
                  size={8}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
