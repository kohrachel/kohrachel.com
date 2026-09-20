import { QUIRKY_LINES } from "@/lib/constants/quirky-lines";
import { getRandomNumber } from "@/server/random/get";

// Dynamic (changes per request) — isolated in its own async component so it can
// stream behind <Suspense> without blocking the rest of the page's prerender.
export async function QuoteOfTheDay() {
  const random = await getRandomNumber();
  const quote =
    QUIRKY_LINES[
      Math.floor(random * QUIRKY_LINES.length) % QUIRKY_LINES.length
    ];
  return (
    <section
      data-not-typeset
      className="w-full flex flex-col items-center justify-center gap-2 bg-stone-900 p-6 text-center font-basteleur"
    >
      <p>{quote}</p>
    </section>
  );
}
