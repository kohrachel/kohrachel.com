import { describe, expect, test } from "bun:test";
import { goodreadsPublishedAt } from "./goodreads";

const LINK = "https://www.goodreads.com/book/show/25734172";
const WORK = "Work:kca://work/amzn1.gr.work.v1.7fJTJZbKkLjl6nMr405u3Q";

/** A Goodreads book page reduced to its app data, as the real page lays it out. */
const page = (apolloState: Record<string, unknown>) =>
  `<html><head><title>Seven Brief Lessons on Physics</title></head><body>
  <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps: { apolloState } },
  })}</script></body></html>`;

const book = (overrides: Record<string, unknown> = {}) => ({
  __typename: "Book",
  legacyId: 25734172,
  work: { __ref: WORK },
  details: { publicationTime: 1456819200000 },
  ...overrides,
});
const work = (publicationTime: number | null) => ({
  __typename: "Work",
  details: { publicationTime },
});

describe("goodreadsPublishedAt", () => {
  test("gives the work's first-published day, not the edition's", () => {
    // 1413961200000 is midnight Pacific on 22 October 2014.
    const html = page({
      "Book:kca://book/a": book(),
      [WORK]: work(1413961200000),
    });
    expect(goodreadsPublishedAt(html, LINK)).toBe("2014-10-22T00:00:00.000Z");
  });

  test("falls back to the edition's day when the work has none", () => {
    const html = page({ "Book:kca://book/a": book(), [WORK]: work(null) });
    expect(goodreadsPublishedAt(html, LINK)).toBe("2016-03-01T00:00:00.000Z");
  });

  test("reads the linked book, not other books on the page", () => {
    const html = page({
      "Book:kca://book/other": book({
        legacyId: 129915654,
        work: { __ref: "Work:other" },
      }),
      "Work:other": work(0),
      "Book:kca://book/a": book(),
      [WORK]: work(1413961200000),
    });
    expect(goodreadsPublishedAt(html, LINK)).toBe("2014-10-22T00:00:00.000Z");
  });

  test("keeps the day for books from before 1970", () => {
    // Pride and Prejudice: midnight Pacific on 28 January 1813.
    const html = page({
      "Book:kca://book/a": book(),
      [WORK]: work(-4952073600000),
    });
    expect(goodreadsPublishedAt(html, LINK)).toBe("1813-01-28T00:00:00.000Z");
  });

  test("skips dates from before year 1, without using the edition's", () => {
    // The Odyssey, about 800 BC.
    const html = page({
      "Book:kca://book/a": book(),
      [WORK]: work(-87412752422000),
    });
    expect(goodreadsPublishedAt(html, LINK)).toBeNull();
  });

  test.each([
    ["a page without app data", "<html><title>Goodreads</title></html>"],
    [
      "broken app data",
      '<script id="__NEXT_DATA__" type="application/json">{oops</script>',
    ],
    ["app data without the book", page({ [WORK]: work(1413961200000) })],
  ])("gives nothing for %s", (_, html) => {
    expect(goodreadsPublishedAt(html, LINK)).toBeNull();
  });

  test("gives nothing for links that aren't books", () => {
    const html = page({
      "Book:kca://book/a": book(),
      [WORK]: work(1413961200000),
    });
    expect(
      goodreadsPublishedAt(
        html,
        "https://www.goodreads.com/author/show/108952",
      ),
    ).toBeNull();
  });
});
