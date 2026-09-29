"use client";

import { PEOPLE } from "@/lib/constants/people";
import { WallOfText } from "./WallOfText";

export function PeopleSection({ className }: { className?: string }) {
  return (
    <section className={`bg-stone-900 p-7 flex flex-col gap-5 ${className ?? ""}`}>
      <span className="font-basteleur text-primary">{`public figures i admire`}</span>
      <WallOfText
        items={PEOPLE}
        getText={(person) => person.name}
        getLink={(person) => person.link}
      />
    </section>
  );
}
