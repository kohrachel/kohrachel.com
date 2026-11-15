import { describe, expect, test } from "bun:test";
import { isoDurationToSeconds, parsePageMeta } from "./page-meta";

const page = (head: string, body = "") =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

describe("parsePageMeta", () => {
  test("reads Open Graph, article and JSON-LD details", () => {
    const html = page(`
      <title>Fallback title | Some Blog</title>
      <meta property="og:title" content="We are goldfish &amp; my bowl is better">
      <meta property="og:description" content="  A post
        about attention.  ">
      <meta property="og:image" content="/images/cover.png">
      <meta property="article:published_time" content="2024-03-04T10:00:00+08:00">
      <script type="application/ld+json">
        {"@context":"https://schema.org","@graph":[
          {"@type":"WebSite","name":"Some Blog"},
          {"@type":"BlogPosting","headline":"Ignored, og:title wins",
           "author":[{"@type":"Person","name":"Rachel Koh"},{"name":"A. N. Other"}],
           "datePublished":"2020-01-01"}
        ]}
      </script>
    `);
    const { details, oembedUrl } = parsePageMeta(
      html,
      "https://blog.example/posts/goldfish",
    );
    expect(details).toEqual({
      title: "We are goldfish & my bowl is better",
      creator: "Rachel Koh, A. N. Other",
      publishedAt: "2024-03-04T02:00:00.000Z",
      description: "A post about attention.",
      thumbnailUrl: "https://blog.example/images/cover.png",
      durationSeconds: null,
      width: null,
      height: null,
    });
    expect(oembedUrl).toBeNull();
  });

  test("falls back to <title>, name meta and JSON-LD", () => {
    const html = page(`
      <title> Project Hail Mary &#8212; a review &#x1F680; </title>
      <meta content='Andy Weir' name='author'>
      <script type="application/ld+json">{"@type":"Article","datePublished":"2021-05-04","image":{"url":"https://img.example/a.jpg"}}</script>
    `);
    const { details } = parsePageMeta(html, "https://example.com/");
    expect(details.title).toBe("Project Hail Mary — a review 🚀");
    expect(details.creator).toBe("Andy Weir");
    expect(details.publishedAt).toBe("2021-05-04T00:00:00.000Z");
    expect(details.thumbnailUrl).toBe("https://img.example/a.jpg");
  });

  test("ignores authors that are links and images that aren't http", () => {
    const html = page(`
      <meta property="article:author" content="https://facebook.com/someone">
      <meta property="og:image" content="javascript:alert(1)">
    `);
    const { details } = parsePageMeta(html, "https://example.com/");
    expect(details.creator).toBeNull();
    expect(details.thumbnailUrl).toBeNull();
  });

  test("finds the oEmbed endpoint and video size", () => {
    const html = page(`
      <link rel="alternate" type="application/json+oembed" href="https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc&amp;format=json" title="x">
      <meta property="og:video:width" content="1080">
      <meta property="og:video:height" content="1920">
      <meta itemprop="duration" content="PT1M5S">
    `);
    const { details, oembedUrl } = parsePageMeta(
      html,
      "https://www.youtube.com/watch?v=abc",
    );
    expect(oembedUrl).toBe(
      "https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc&format=json",
    );
    expect(details.width).toBe(1080);
    expect(details.height).toBe(1920);
  });

  test("only reads meta tags from the head", () => {
    const html = page(
      `<title>Real</title>`,
      `<meta property="og:title" content="From a comment in the body">`,
    );
    expect(parsePageMeta(html, "https://example.com/").details.title).toBe(
      "Real",
    );
  });

  test("returns empty details for a page with nothing in it", () => {
    const { details } = parsePageMeta("<html></html>", "https://example.com/");
    expect(Object.values(details).every((v) => v === null)).toBe(true);
  });

  test("ignores malformed JSON-LD and invalid dates", () => {
    const html = page(`
      <meta property="article:published_time" content="not a date">
      <script type="application/ld+json">{ broken json </script>
    `);
    expect(
      parsePageMeta(html, "https://example.com/").details.publishedAt,
    ).toBeNull();
  });
});

describe("isoDurationToSeconds", () => {
  test.each([
    ["PT1H2M3S", 3723],
    ["PT4M13S", 253],
    ["PT45S", 45],
    ["P1DT1S", 86401],
    ["PT0S", null],
    ["P", null],
    ["4:13", null],
  ] as const)("%s", (input, expected) => {
    expect(isoDurationToSeconds(input)).toBe(expected);
  });
});
