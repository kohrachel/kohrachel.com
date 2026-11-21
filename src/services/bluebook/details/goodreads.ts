import type { ItemDetails } from "@/domain-types/bluebook/details";
import { cleanText } from "./page-meta";

type ApolloRecord = {
  __typename?: string;
  legacyId?: number;
  title?: string;
  work?: { __ref?: string };
  details?: { publicationTime?: number | null };
  bookSeries?: { userPosition?: string; series?: { __ref?: string } }[];
};

/**
 * Details of the book at a Goodreads `/book/show/<id>` link, from the app
 * data in its page (`__NEXT_DATA__`):
 * - its title without the series, which the page's `og:title` adds
 *   ("The Hunger Games (The Hunger Games, #1)")
 * - the series it's in and its place there (`"1"`, or `"1-3"` for an omnibus)
 * - when it was first published: the work's date (the book in any edition),
 *   else this edition's if the work has none. Goodreads keeps dates as
 *   midnight Pacific time; the day is returned at midnight UTC, like a
 *   typed-in date.
 *
 * Fields the page doesn't have are left out.
 */
export function goodreadsBookDetails(
  html: string,
  url: string,
): Partial<ItemDetails> {
  const id = new URL(url).pathname.match(/^\/book\/show\/(\d+)/)?.[1];
  const json = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1];
  if (!id || !json) return {};

  const records = apolloState(json);
  const book = Object.values(records).find(
    (record) => record.__typename === "Book" && String(record.legacyId) === id,
  );
  if (!book) return {};

  const workRef = book.work?.__ref;
  const workTime = workRef
    ? records[workRef]?.details?.publicationTime
    : undefined;
  const publishedAt =
    typeof workTime === "number"
      ? dayOf(workTime)
      : dayOf(book.details?.publicationTime);
  // The first series is the one the full title names.
  const inSeries = book.bookSeries?.find((entry) =>
    cleanText(records[entry.series?.__ref ?? ""]?.title),
  );
  const series = cleanText(records[inSeries?.series?.__ref ?? ""]?.title);

  return withoutEmpty({
    title: cleanText(book.title),
    publishedAt,
    series,
    seriesPosition: series ? cleanText(inSeries?.userPosition) : null,
  });
}

function apolloState(json: string): Record<string, ApolloRecord> {
  try {
    const data = JSON.parse(json) as {
      props?: { pageProps?: { apolloState?: Record<string, ApolloRecord> } };
    };
    return data.props?.pageProps?.apolloState ?? {};
  } catch {
    return {};
  }
}

/** Ancient works (years before 1) can't be entered as a date, so they're skipped. */
function dayOf(ms: number | null | undefined) {
  if (typeof ms !== "number") return null;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1) return null;
  return `${date.toISOString().slice(0, 10)}T00:00:00.000Z`;
}

function withoutEmpty(details: Partial<ItemDetails>) {
  return Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== null),
  ) as Partial<ItemDetails>;
}
