import PostText from "@/components/PostText";
import { listPosts } from "@/server/posts/list";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleIcon } from "@hugeicons/core-free-icons";

export default async function Home() {
  const posts = await listPosts({});
  const wallOfPosts = Array(5).fill(posts).flat();

  return (
    <main className="text-center">
      <h1>rachel koh</h1>
      <ul className="p-0!">
        {wallOfPosts.map(({ id, title, description }, index) => (
          <li key={index} className="inline">
            <PostText id={id} title={title} description={description} />
            {index !== wallOfPosts.length - 1 && (
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
