"use client";

import { useEffect, useState } from "react";

const NUMBER_OF_VARIANTS = 5;
const CYCLE_INTERVAL_MS = 2000;

export default function Header() {
  const [activeVariant, setActiveVariant] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVariant((prev) => (prev + 1) % NUMBER_OF_VARIANTS);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
  return (
    <header className="w-full h-24 flex items-center justify-center gap-6 py-4 bg-black/60 bg-cover bg-blend-overlay rounded-4xl">
      <img
        src={`rachel-${activeVariant + 1}.PNG`}
        alt="Rachel Koh"
        className="h-3/4 md:h-full mt-0"
      />
      <img
        src={`koh-${activeVariant + 1}.PNG`}
        alt="Rachel Koh"
        className="h-3/4 md:h-full mt-0"
      />
    </header>
  );
}
