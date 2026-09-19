import { QUIRKY_LINES } from "@/lib/constants/quirky-lines";
import { getRandomNumber } from "@/server/random/get";

// Dynamic (changes per request) — isolated in its own async component so it can
// stream behind <Suspense> without blocking the rest of the page's prerender.
export async function QuirkyLine() {
  const random = await getRandomNumber();
  const quirkyLine =
    QUIRKY_LINES[Math.floor(random * QUIRKY_LINES.length) % QUIRKY_LINES.length];
  return (
    <p className="lg:col-span-4 bg-stone-900 p-4 flex items-center justify-center text-center">
      {quirkyLine}
    </p>
  );
}
