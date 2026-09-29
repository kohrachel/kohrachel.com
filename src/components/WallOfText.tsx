"use client";

import { DotIcon } from "@hugeicons/core-free-icons";
import { Separator } from "./PostWallElement";
import { useEffect, useState } from "react";
import Link from "next/link";

const CYCLE_INTERVAL_MS = 3000;

interface WallOfTextProps<T> {
  items: T[];
  /** Extract the display text from an item. */
  getText: (item: T) => string;
  /** Optionally extract a link for an item. If it returns a falsy value, the text is rendered as plain text. */
  getLink?: (item: T) => string | undefined;
}

export function WallOfText<T>({ items, getText, getLink }: WallOfTextProps<T>) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Cycle the active item through all entries over time.
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <ul className="list-none p-0! mt-0! text-justify" data-not-typeset>
      {items.map((item, index) => {
        const text = getText(item);
        const link = getLink?.(item);
        const className = `inline align-middle transition-all duration-300 ${
          activeIndex === index ? "text-primary" : "text-green-800"
        }`;

        return (
          <li key={text} className="inline p-0!">
            {link ? (
              <Link href={link} className={className}>
                {text}
              </Link>
            ) : (
              <span className={className}>{text}</span>
            )}
            {index !== items.length - 1 && (
              <Separator separatorIcon={DotIcon} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
