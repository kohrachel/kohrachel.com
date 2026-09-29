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
  /** Optionally control the active index externally (to sync multiple walls). */
  activeIndex?: number;
  /** Called with an item's index when it is hovered. */
  onHoverIndex?: (index: number) => void;
}

export function WallOfText<T>({
  items,
  getText,
  getLink,
  activeIndex: controlledActiveIndex,
  onHoverIndex,
}: WallOfTextProps<T>) {
  const [internalActiveIndex, setInternalActiveIndex] = useState<number>(0);
  const isControlled = controlledActiveIndex !== undefined;
  const activeIndex = isControlled
    ? controlledActiveIndex
    : internalActiveIndex;

  // Cycle the active item through all entries over time (only when uncontrolled).
  useEffect(() => {
    if (isControlled) return;
    const interval = setInterval(() => {
      setInternalActiveIndex((prev) => (prev + 1) % items.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [items, isControlled]);

  return (
    <ul className="list-none p-0! mt-0! text-justify" data-not-typeset>
      {items.map((item, index) => {
        const text = getText(item);
        const link = getLink?.(item);
        const className = `inline align-middle transition-all duration-300 ${
          activeIndex === index ? "text-primary" : "text-green-800"
        }`;

        return (
          <li
            key={text}
            className="inline p-0!"
            onMouseEnter={() => onHoverIndex?.(index)}
          >
            {link ? (
              <Link
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`${className} underline underline-offset-4 transition-[text-decoration-color] duration-500 ${
                  activeIndex === index
                    ? "decoration-current"
                    : "decoration-transparent"
                }`}
              >
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
