"use client";

import { useEffect, useState } from "react";
import { PEOPLE } from "@/lib/constants/people";
import { WallOfText } from "./WallOfText";

const CYCLE_INTERVAL_MS = 3000;

export function PeopleSection({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Auto-cycle the shared active index, pausing while the user hovers.
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PEOPLE.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section
      className={`bg-stone-900 p-7 flex flex-col gap-5 ${className ?? ""}`}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className="font-basteleur text-primary">{`public figures i admire`}</span>
      <WallOfText
        items={PEOPLE}
        getText={(person) => person.name}
        getLink={(person) => person.link}
        activeIndex={activeIndex}
        onHoverIndex={(index) => {
          setIsHovering(true);
          setActiveIndex(index);
        }}
      />
      <span className="font-basteleur text-primary">{`why i admire them`}</span>
      <div
        className="relative flex w-full min-h-32 items-center overflow-hidden rounded-lg border-4 border-black/70 bg-[url('/flowers-blur.jpg')] bg-cover bg-center p-5 before:absolute before:inset-0 before:bg-black/50"
        data-not-typeset
      >
        <p className="relative z-10 w-full text-center font-semibold text-primary">
          {PEOPLE[activeIndex].reason}
        </p>
      </div>
    </section>
  );
}
