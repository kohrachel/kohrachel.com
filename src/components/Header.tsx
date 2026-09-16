"use client";

import { useEffect, useState } from "react";

const CYCLE_INTERVAL_MS = 2000;

type HeaderProps = {
  rachelSrcs: string[];
  kohSrcs: string[];
};

export default function Header({ rachelSrcs, kohSrcs }: HeaderProps) {
  const variantCount = Math.min(rachelSrcs.length, kohSrcs.length);
  const [activeVariant, setActiveVariant] = useState<number>(0);
  useEffect(() => {
    if (variantCount === 0) return;
    const interval = setInterval(() => {
      setActiveVariant((prev) => (prev + 1) % variantCount);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [variantCount]);
  return (
    <header className="w-full h-24 flex items-center justify-center gap-6 py-4 bg-black/60 bg-cover bg-blend-overlay rounded-4xl">
      <img
        src={rachelSrcs[activeVariant]}
        alt="Rachel Koh"
        className="h-3/4 md:h-full mt-0"
      />
      <img
        src={kohSrcs[activeVariant]}
        alt="Rachel Koh"
        className="h-3/4 md:h-full mt-0"
      />
    </header>
  );
}
