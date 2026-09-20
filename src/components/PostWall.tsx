"use client";

import { DotIcon } from "@hugeicons/core-free-icons";
import { Separator } from "./PostWallElement";
import { useEffect, useState } from "react";

const CYCLE_INTERVAL_MS = 3000;

export default function WallOfText({ people }: { people: string[] }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Cycle the active person through all entries over time.
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % people.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [people]);

  return (
    <ul className="list-none p-0! mt-0! text-justify" data-not-typeset>
      {people.map((name, index) => (
        <li key={name} className="inline p-0!">
          <span
            className={`inline align-middle transition-all duration-300 ${
              activeIndex === index ? "text-primary" : "text-green-800"
            }`}
          >
            {name}
          </span>
          {index !== people.length - 1 && <Separator separatorIcon={DotIcon} />}
        </li>
      ))}
    </ul>
  );
}
