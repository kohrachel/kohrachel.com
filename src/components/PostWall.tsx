"use client";

import { DotIcon } from "@hugeicons/core-free-icons";
import MainContent, { Separator } from "./PostWallElement";
import { useEffect, useState } from "react";
import { Post } from "@/db/schema";

const CYCLE_INTERVAL_MS = 3000;

export default function WallOfText({ posts }: { posts: Post[] }) {
  const [activePostIndex, setActivePostIndex] = useState<number>(0);

  // Cycle the active post through all ids over time.
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePostIndex((prev) => (prev + 1) % posts.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [posts]);

  const activePostId = posts[activePostIndex].id;

  return (
    <ul className="p-0! mt-0! text-justify">
      {posts.map(({ id, title }) => (
        <li key={`title-${id}`} className="inline p-0!">
          <MainContent
            id={id}
            active={activePostId === id}
            className="text-6xl no-underline hover:underline"
          >
            {title}
          </MainContent>
          <Separator separatorIcon={DotIcon} />
        </li>
      ))}
      {posts.map(({ id, description }, index) => (
        <li key={`desc-${id}`} className="inline p-0!">
          <MainContent id={id} active={activePostId === id}>
            {description}
          </MainContent>
          {index !== posts.length - 1 && <Separator separatorIcon={DotIcon} />}
        </li>
      ))}
    </ul>
  );
}
