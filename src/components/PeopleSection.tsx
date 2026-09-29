"use client";

import { useEffect, useState } from "react";
import { PEOPLE } from "@/lib/constants/people";
import { WallOfText } from "./WallOfText";

const CYCLE_INTERVAL_MS = 3000;

export function PeopleSection({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Drive both walls with a single shared active index.
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PEOPLE.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`bg-stone-900 p-7 flex flex-col gap-5 ${className ?? ""}`}>
      <span className="font-basteleur text-primary">{`public figures i admire`}</span>
      <WallOfText
        items={PEOPLE}
        getText={(person) => person.name}
        getLink={(person) => person.link}
        activeIndex={activeIndex}
      />
      <span className="font-basteleur text-primary">{`why i admire them`}</span>
      <p className="text-green-800">{PEOPLE[activeIndex].reason}</p>
    </section>
  );
}
