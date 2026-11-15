import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { DETAILS_MAX_PAGE_BYTES } from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { fetchDetails, type DetailsInput } from "./fetch-details";

type Route = (init?: RequestInit) => Response | Promise<Response>;
let routes: Record<string, Route>;
let requested: string[];
const realFetch = globalThis.fetch;

beforeEach(() => {
  routes = {};
  requested = [];
  globalThis.fetch = mock(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      requested.push(url);
      const route = routes[url];
      return route ? route(init) : new Response("not found", { status: 404 });
    },
  ) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const html = (body: string) => () =>
  new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
const json = (body: unknown) => () =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
const redirect = (location: string) => () =>
  new Response(null, { status: 302, headers: { location } });

const input = (overrides: Partial<DetailsInput>): DetailsInput => ({
  url: "https://example.com/post",
  resolvedUrl: "https://example.com/post",
  normalizedUrl: "https://example.com/post",
  commonPlatform: null,
  pastedText: "https://example.com/post",
  ...overrides,
});

describe("fetchDetails", () => {
  test("combines oEmbed and page meta, recording each field's source", async () => {
    routes["https://example.com/post"] = html(`<head>
      <link rel="alternate" type="application/json+oembed" href="https://example.com/oembed?url=x">
      <meta property="og:title" content="Page title">
      <meta property="og:description" content="About the post">
      <meta property="article:published_time" content="2024-01-02T00:00:00Z">
    </head>`);
    routes["https://example.com/oembed?url=x"] = json({
      type: "rich",
      title: "oEmbed title",
      author_name: "Writer",
    });

    const result = await fetchDetails(input({}));
    expect(result.details.title).toBe("oEmbed title");
    expect(result.details.creator).toBe("Writer");
    expect(result.details.description).toBe("About the post");
    expect(result.details.publishedAt).toBe("2024-01-02T00:00:00.000Z");
    expect(result.sources).toEqual({
      title: "oembed",
      creator: "oembed",
      description: "page_meta",
      publishedAt: "page_meta",
    });
  });

  test("sends bluebook's user agent", async () => {
    let userAgent = null as string | null;
    routes["https://example.com/post"] = (init) => {
      userAgent = new Headers(init?.headers).get("user-agent");
      return html("<title>x</title>")();
    };
    await fetchDetails(input({}));
    expect(userAgent).toBe("bluebook/1.0 (+https://bluebook.kohrachel.com)");
  });

  test("gives every request a timeout", async () => {
    let signal: AbortSignal | null | undefined;
    routes["https://example.com/post"] = (init) => {
      signal = init?.signal;
      return html("<title>x</title>")();
    };
    await fetchDetails(input({}));
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  test("follows redirects, but never to a private address", async () => {
    routes["https://example.com/post"] = redirect("https://example.com/moved");
    routes["https://example.com/moved"] = html("<title>Moved</title>");
    expect((await fetchDetails(input({}))).details.title).toBe("Moved");

    routes["https://example.com/post"] = redirect(
      "http://169.254.169.254/latest",
    );
    const result = await fetchDetails(input({}));
    expect(result.details.title).toBeNull();
    expect(requested).not.toContain("http://169.254.169.254/latest");
  });

  test("gives up after too many redirects", async () => {
    for (let i = 0; i < 10; i++) {
      routes[`https://example.com/r${i}`] = redirect(
        `https://example.com/r${i + 1}`,
      );
    }
    routes["https://example.com/r10"] = html("<title>Too far</title>");
    const result = await fetchDetails(
      input({ resolvedUrl: "https://example.com/r0" }),
    );
    expect(result.details.title).toBeNull();
  });

  test("only reads the start of a huge page", async () => {
    // No </head>, so the whole text read counts as the head: the late
    // og:title would win if the cap didn't stop reading first.
    const padding = "x".repeat(DETAILS_MAX_PAGE_BYTES * 2);
    routes["https://example.com/post"] = html(
      `<title>Early</title>${padding}<meta property="og:title" content="Late">`,
    );
    expect((await fetchDetails(input({}))).details.title).toBe("Early");
  });

  test("ignores responses that aren't HTML", async () => {
    routes["https://example.com/post"] = () =>
      new Response("%PDF-1.7 <title>Not a page</title>", {
        headers: { "content-type": "application/pdf" },
      });
    expect((await fetchDetails(input({}))).details.title).toBeNull();
  });

  test("falls back to the share text when the page can't be read", async () => {
    routes["https://www.bilibili.com/video/BV1Tyaf6FEcq"] = () =>
      new Response("blocked", { status: 412 });
    const result = await fetchDetails(
      input({
        url: "https://b23.tv/yIlus27",
        resolvedUrl: "https://www.bilibili.com/video/BV1Tyaf6FEcq",
        normalizedUrl: "https://www.bilibili.com/video/BV1Tyaf6FEcq",
        commonPlatform: CommonPlatform.Bilibili,
        pastedText: "【一个视频-哔哩哔哩】 https://b23.tv/yIlus27",
      }),
    );
    expect(result.details.title).toBe("一个视频");
    expect(result.sources).toEqual({ title: "share_text" });
  });

  test("never throws when the network fails", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const result = await fetchDetails(input({}));
    expect(result.details.title).toBeNull();
    expect(result.sources).toEqual({});
  });

  test("fetches the page as resolved, keeping share tokens", async () => {
    const resolvedUrl =
      "https://www.xiaohongshu.com/discovery/item/6ad2fd18000000000a02491a?xsec_token=abc";
    routes[resolvedUrl] = html("<title>A note</title>");
    const result = await fetchDetails(
      input({
        resolvedUrl,
        normalizedUrl:
          "https://www.xiaohongshu.com/explore/6ad2fd18000000000a02491a",
        commonPlatform: CommonPlatform.Xiaohongshu,
      }),
    );
    expect(result.details.title).toBe("A note");
  });

  test("throws away login walls and error pages", async () => {
    routes["https://example.com/post"] = redirect(
      "https://www.rednote.com/login?redirectPath=%2Fexplore%2Fabc",
    );
    routes["https://www.rednote.com/login?redirectPath=%2Fexplore%2Fabc"] =
      html(`<meta property="og:title" content="Log in - rednote">`);
    expect((await fetchDetails(input({}))).details.title).toBeNull();
  });

  test("ignores titles that only name the platform", async () => {
    const post = {
      resolvedUrl:
        "https://www.reddit.com/r/sysadmin/comments/1xwwks0/root_cause/",
      normalizedUrl: "https://www.reddit.com/comments/1xwwks0/",
      commonPlatform: CommonPlatform.Reddit,
    };
    routes[post.normalizedUrl] = html(`<title>Reddit</title>`);
    expect((await fetchDetails(input(post))).details.title).toBeNull();
  });

  test("calls known oEmbed endpoints with the right form of the link", async () => {
    const youtube = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    routes[
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youtube)}`
    ] = json({
      type: "video",
      title: "Never Gonna Give You Up",
      author_name: "Rick Astley",
      width: 200,
      height: 113,
    });
    const video = await fetchDetails(
      input({
        resolvedUrl: youtube,
        normalizedUrl: youtube,
        commonPlatform: CommonPlatform.YouTube,
      }),
    );
    expect(video.details).toMatchObject({
      title: "Never Gonna Give You Up",
      creator: "Rick Astley",
      width: 200,
      height: 113,
    });

    // Reddit's endpoint needs the full link with the subreddit.
    const full =
      "https://www.reddit.com/r/sysadmin/comments/1xwwks0/root_cause/";
    routes[`https://www.reddit.com/oembed?url=${encodeURIComponent(full)}`] =
      json({ type: "rich", title: "Root cause", author_name: "someone" });
    const post = await fetchDetails(
      input({
        resolvedUrl: full,
        normalizedUrl: "https://www.reddit.com/comments/1xwwks0/",
        commonPlatform: CommonPlatform.Reddit,
      }),
    );
    expect(post.details.title).toBe("Root cause");
  });

  test("reads an X post's text and date from its embed", async () => {
    const link = "https://x.com/i/status/20";
    routes[
      `https://publish.x.com/oembed?omit_script=1&url=${encodeURIComponent(link)}`
    ] = json({
      type: "rich",
      author_name: "jack",
      html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">just setting up my twttr<br>second line &amp; more</p>&mdash; jack (@jack) <a href="https://twitter.com/jack/status/20">March 21, 2006</a></blockquote>',
    });
    const result = await fetchDetails(
      input({
        resolvedUrl: link,
        normalizedUrl: link,
        commonPlatform: CommonPlatform.X,
      }),
    );
    expect(result.details).toMatchObject({
      title: "just setting up my twttr",
      creator: "jack",
      description: "just setting up my twttr second line & more",
      publishedAt: new Date("March 21, 2006").toISOString(),
    });
  });

  test("fetches Bilibili at the cleaned link, not a translated /en/ page", async () => {
    routes["https://www.bilibili.com/video/BV1Tyaf6FEcq"] = html(
      `<meta property="og:title" content="中文标题">`,
    );
    routes["https://www.bilibili.com/en/video/BV1Tyaf6FEcq?p=1"] = html(
      `<meta property="og:title" content="English title">`,
    );
    const result = await fetchDetails(
      input({
        resolvedUrl: "https://www.bilibili.com/en/video/BV1Tyaf6FEcq?p=1",
        normalizedUrl: "https://www.bilibili.com/video/BV1Tyaf6FEcq",
        commonPlatform: CommonPlatform.Bilibili,
      }),
    );
    expect(result.details.title).toBe("中文标题");
  });

  describe("Wikipedia", () => {
    const article = {
      normalizedUrl: "https://en.wikipedia.org/wiki/Mariah_Carey",
      resolvedUrl: "https://en.wikipedia.org/wiki/Mariah_Carey",
      commonPlatform: CommonPlatform.Wikipedia,
    };

    test("uses the summary API", async () => {
      routes["https://en.wikipedia.org/api/rest_v1/page/summary/Mariah_Carey"] =
        json({
          title: "Mariah Carey",
          extract: "Mariah Carey is an American singer.",
          thumbnail: { source: "https://upload.wikimedia.org/carey.jpg" },
        });
      const result = await fetchDetails(input(article));
      expect(result.details).toMatchObject({
        title: "Mariah Carey",
        creator: null,
        description: "Mariah Carey is an American singer.",
        thumbnailUrl: "https://upload.wikimedia.org/carey.jpg",
      });
      expect(result.sources.title).toBe("wikipedia_api");
    });

    test("falls back to the page when the API fails", async () => {
      routes[article.normalizedUrl] = html(
        `<meta property="og:title" content="Mariah Carey - Wikipedia">`,
      );
      const result = await fetchDetails(input(article));
      expect(result.details.title).toBe("Mariah Carey");
      expect(result.sources.title).toBe("page_meta");
    });
  });
});
