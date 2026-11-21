type ApolloRecord = {
  __typename?: string;
  legacyId?: number;
  work?: { __ref?: string };
  details?: { publicationTime?: number | null };
};

/**
 * When the book at a Goodreads `/book/show/<id>` link was first published,
 * from the app data in its page (`__NEXT_DATA__`): the work's date (the book
 * in any edition), else this edition's if the work has none. Goodreads keeps
 * dates as midnight Pacific time; the day is returned at midnight UTC, like a
 * typed-in date.
 */
export function goodreadsPublishedAt(html: string, url: string) {
  const id = new URL(url).pathname.match(/^\/book\/show\/(\d+)/)?.[1];
  const json = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1];
  if (!id || !json) return null;

  const records = apolloState(json);
  const book = Object.values(records).find(
    (record) => record.__typename === "Book" && String(record.legacyId) === id,
  );
  const workRef = book?.work?.__ref;
  const workTime = workRef
    ? records[workRef]?.details?.publicationTime
    : undefined;
  return typeof workTime === "number"
    ? dayOf(workTime)
    : dayOf(book?.details?.publicationTime);
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
