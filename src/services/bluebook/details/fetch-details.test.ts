import { describe, expect, mock, test } from "bun:test";
import { DETAILS_MAX_PAGE_BYTES } from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { html, json, redirect, installFakeNetwork } from "@/test/fake-network";
import { fetchDetails, type DetailsInput } from "./fetch-details";

const network = installFakeNetwork();

/** The start of a PNG: enough to read its size. */
const png = (width: number, height: number) => {
  const bytes = new Uint8Array(29);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes.set([8, 6, 0, 0, 0], 24);
  return bytes;
};

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
    network.routes["https://example.com/post"] = html(`<head>
      <link rel="alternate" type="application/json+oembed" href="https://example.com/oembed?url=x">
      <meta property="og:title" content="Page title">
      <meta property="og:description" content="About the post">
      <meta property="article:published_time" content="2024-01-02T00:00:00Z">
    </head>`);
    network.routes["https://example.com/oembed?url=x"] = json({
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
    network.routes["https://example.com/post"] = (init) => {
      userAgent = new Headers(init?.headers).get("user-agent");
      return html("<title>x</title>")();
    };
    await fetchDetails(input({}));
    expect(userAgent).toBe("bluebook/1.0 (+https://bluebook.kohrachel.com)");
  });

  test("gives every request a timeout", async () => {
    let signal: AbortSignal | null | undefined;
    network.routes["https://example.com/post"] = (init) => {
      signal = init?.signal;
      return html("<title>x</title>")();
    };
    await fetchDetails(input({}));
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  test("follows redirects, but never to a private address", async () => {
    network.routes["https://example.com/post"] = redirect(
      "https://example.com/moved",
    );
    network.routes["https://example.com/moved"] = html("<title>Moved</title>");
    expect((await fetchDetails(input({}))).details.title).toBe("Moved");

    network.routes["https://example.com/post"] = redirect(
      "http://169.254.169.254/latest",
    );
    const result = await fetchDetails(input({}));
    expect(result.details.title).toBeNull();
    expect(network.requested).not.toContain("http://169.254.169.254/latest");
  });

  test("gives up after too many redirects", async () => {
    for (let i = 0; i < 10; i++) {
      network.routes[`https://example.com/r${i}`] = redirect(
        `https://example.com/r${i + 1}`,
      );
    }
    network.routes["https://example.com/r10"] = html("<title>Too far</title>");
    const result = await fetchDetails(
      input({ resolvedUrl: "https://example.com/r0" }),
    );
    expect(result.details.title).toBeNull();
  });

  test("only reads the start of a huge page", async () => {
    // No </head>, so the whole text read counts as the head: the late
    // og:title would win if the cap didn't stop reading first.
    const padding = "x".repeat(DETAILS_MAX_PAGE_BYTES * 2);
    network.routes["https://example.com/post"] = html(
      `<title>Early</title>${padding}<meta property="og:title" content="Late">`,
    );
    expect((await fetchDetails(input({}))).details.title).toBe("Early");
  });

  test("ignores responses that aren't HTML", async () => {
    network.routes["https://example.com/post"] = () =>
      new Response("%PDF-1.7 <title>Not a page</title>", {
        headers: { "content-type": "application/pdf" },
      });
    expect((await fetchDetails(input({}))).details.title).toBeNull();
  });

  test("falls back to the share text when the page can't be read", async () => {
    network.routes["https://www.bilibili.com/video/BV1Tyaf6FEcq"] = () =>
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
    network.routes[resolvedUrl] = html("<title>A note</title>");
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
    network.routes["https://example.com/post"] = redirect(
      "https://www.rednote.com/login?redirectPath=%2Fexplore%2Fabc",
    );
    network.routes[
      "https://www.rednote.com/login?redirectPath=%2Fexplore%2Fabc"
    ] = html(`<meta property="og:title" content="Log in - rednote">`);
    expect((await fetchDetails(input({}))).details.title).toBeNull();
  });

  test("ignores titles that only name the platform", async () => {
    const post = {
      resolvedUrl:
        "https://www.reddit.com/r/sysadmin/comments/1xwwks0/root_cause/",
      normalizedUrl: "https://www.reddit.com/comments/1xwwks0/",
      commonPlatform: CommonPlatform.Reddit,
    };
    network.routes[post.normalizedUrl] = html(`<title>Reddit</title>`);
    expect((await fetchDetails(input(post))).details.title).toBeNull();
  });

  test("calls known oEmbed endpoints with the right form of the link", async () => {
    const youtube = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    // Asked with the /shorts/ form, so YouTube reports the video's real shape.
    const shorts = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
    network.routes[
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(shorts)}`
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
    network.routes[
      `https://www.reddit.com/oembed?url=${encodeURIComponent(full)}`
    ] = json({ type: "rich", title: "Root cause", author_name: "someone" });
    const post = await fetchDetails(
      input({
        resolvedUrl: full,
        normalizedUrl: "https://www.reddit.com/comments/1xwwks0/",
        commonPlatform: CommonPlatform.Reddit,
      }),
    );
    expect(post.details.title).toBe("Root cause");
  });

  describe("a YouTube video's shape", () => {
    const shortInput = (id: string) =>
      input({
        url: `https://youtube.com/shorts/${id}?si=9YnHrm2iYWPjuMtr`,
        resolvedUrl: `https://youtube.com/shorts/${id}?si=9YnHrm2iYWPjuMtr`,
        normalizedUrl: `https://www.youtube.com/watch?v=${id}`,
        commonPlatform: CommonPlatform.YouTube,
      });
    const oembed = (id: string, width: number, height: number) => {
      network.routes[
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/shorts/${id}`)}`
      ] = json({
        type: "video",
        title: "There’s Something Weird Inside Mars",
        thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        width,
        height,
      });
      network.routes[`https://i.ytimg.com/vi/${id}/hqdefault.jpg`] = () =>
        new Response(png(480, 360));
    };

    test("gets a Short's vertical size", async () => {
      oembed("lG4atCDzv0E", 113, 200);
      const result = await fetchDetails(shortInput("lG4atCDzv0E"));
      expect(result.details).toMatchObject({ width: 113, height: 200 });
    });

    test("uses a Short's vertical thumbnail", async () => {
      oembed("lG4atCDzv0E", 113, 200);
      network.routes["https://i.ytimg.com/vi/lG4atCDzv0E/oardefault.jpg"] =
        () => new Response(png(1080, 1920));
      const result = await fetchDetails(shortInput("lG4atCDzv0E"));
      expect(result.details).toMatchObject({
        thumbnailUrl: "https://i.ytimg.com/vi/lG4atCDzv0E/oardefault.jpg",
        thumbnailWidth: 1080,
        thumbnailHeight: 1920,
      });
      expect(result.sources.thumbnailUrl).toBe("link");
    });

    test("keeps the usual thumbnail if the vertical one doesn't load", async () => {
      oembed("lG4atCDzv0E", 113, 200);
      const result = await fetchDetails(shortInput("lG4atCDzv0E"));
      expect(result.details).toMatchObject({
        thumbnailUrl: "https://i.ytimg.com/vi/lG4atCDzv0E/hqdefault.jpg",
        thumbnailWidth: 480,
        thumbnailHeight: 360,
      });
      expect(result.sources.thumbnailUrl).toBe("oembed");
    });

    test("doesn't look for a vertical thumbnail for a horizontal video", async () => {
      oembed("dQw4w9WgXcQ", 200, 113);
      const result = await fetchDetails(shortInput("dQw4w9WgXcQ"));
      expect(result.details.thumbnailUrl).toBe(
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      );
      expect(network.requested).not.toContain(
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/oardefault.jpg",
      );
    });
  });

  test("reads an X post's text and date from its embed", async () => {
    const link = "https://x.com/i/status/20";
    network.routes[
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
    network.routes["https://www.bilibili.com/video/BV1Tyaf6FEcq"] = html(
      `<meta property="og:title" content="中文标题">`,
    );
    network.routes["https://www.bilibili.com/en/video/BV1Tyaf6FEcq?p=1"] = html(
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

  test("throws away bot checks on any site", async () => {
    network.routes["https://example.com/post"] = html(
      `<title>Reddit - Prove your humanity</title><meta name="description" content="x">`,
    );
    const result = await fetchDetails(input({}));
    expect(result.sources).toEqual({});
  });

  test("falls back to a title from the link for profiles", async () => {
    const subreddit = "https://www.reddit.com/r/sysadmin/";
    network.routes[subreddit] = html(
      `<title>Reddit - Prove your humanity</title>`,
    );
    const result = await fetchDetails(
      input({
        resolvedUrl: subreddit,
        normalizedUrl: subreddit,
        commonPlatform: CommonPlatform.Reddit,
      }),
    );
    expect(result.details.title).toBe("r/sysadmin");
    expect(result.sources).toEqual({ title: "link" });
  });

  test("reads a Spotify track's artist, duration and release date from its page", async () => {
    const track = "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl";
    network.routes[track] = html(`<head>
      <link rel="alternate" type="application/json+oembed" href="https://open.spotify.com/oembed?url=x">
      <meta property="og:title" content="Cut To The Feeling"/>
      <meta property="og:description" content="Carly Rae Jepsen · Cut To The Feeling · Song · 2017"/>
      <meta name="music:duration" content="208"/>
      <meta name="music:release_date" content="2017-05-26"/>
      <meta name="music:musician_description" content="Carly Rae Jepsen"/>
    </head>`);
    const result = await fetchDetails(
      input({
        resolvedUrl: track,
        normalizedUrl: track,
        commonPlatform: CommonPlatform.Spotify,
      }),
    );
    expect(result.details).toMatchObject({
      title: "Cut To The Feeling",
      creator: "Carly Rae Jepsen",
      durationSeconds: 208,
      publishedAt: "2017-05-26T00:00:00.000Z",
    });
    expect(network.requested.some((url) => url.includes("/oembed"))).toBe(
      false,
    );
  });

  test("reads a Goodreads book's first-published date from the end of its long page", async () => {
    const link = "https://www.goodreads.com/book/show/25734172";
    const work = "Work:kca://work/1";
    const appData = JSON.stringify({
      props: {
        pageProps: {
          apolloState: {
            "Book:kca://book/1": {
              __typename: "Book",
              legacyId: 25734172,
              work: { __ref: work },
              details: { publicationTime: 1456819200000 },
            },
            [work]: {
              __typename: "Work",
              details: { publicationTime: 1413961200000 },
            },
          },
        },
      },
    });
    // Real pages put the app data past the usual reading limit.
    const padding = "x".repeat(DETAILS_MAX_PAGE_BYTES + 100_000);
    network.routes[link] = html(`<head>
      <meta property="og:title" content="Seven Brief Lessons on Physics"/>
    </head><body>${padding}
    <script id="__NEXT_DATA__" type="application/json">${appData}</script>
    </body>`);
    const result = await fetchDetails(
      input({
        resolvedUrl: link,
        normalizedUrl: link,
        commonPlatform: CommonPlatform.Goodreads,
      }),
    );
    expect(result.details.publishedAt).toBe("2014-10-22T00:00:00.000Z");
    expect(result.sources.publishedAt).toBe("page_meta");
  });

  test("measures the thumbnail, without recording a source for its size", async () => {
    network.routes["https://example.com/post"] = html(
      `<meta property="og:image" content="https://example.com/cover.png">`,
    );
    network.routes["https://example.com/cover.png"] = () =>
      new Response(png(300, 450));
    const result = await fetchDetails(input({}));
    expect(result.details).toMatchObject({
      thumbnailUrl: "https://example.com/cover.png",
      thumbnailWidth: 300,
      thumbnailHeight: 450,
    });
    expect(result.sources.thumbnailUrl).toBe("page_meta");
    expect(result.sources).not.toHaveProperty("thumbnailWidth");
  });

  test("leaves the thumbnail's size empty if it can't be measured", async () => {
    network.routes["https://example.com/post"] = html(
      `<meta property="og:image" content="https://example.com/gone.png">`,
    );
    const result = await fetchDetails(input({}));
    expect(result.details).toMatchObject({
      thumbnailUrl: "https://example.com/gone.png",
      thumbnailWidth: null,
      thumbnailHeight: null,
    });
  });

  describe("Wikipedia", () => {
    const article = {
      normalizedUrl: "https://en.wikipedia.org/wiki/Mariah_Carey",
      resolvedUrl: "https://en.wikipedia.org/wiki/Mariah_Carey",
      commonPlatform: CommonPlatform.Wikipedia,
    };

    test("uses the summary API", async () => {
      network.routes[
        "https://en.wikipedia.org/api/rest_v1/page/summary/Mariah_Carey"
      ] = json({
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
      network.routes[article.normalizedUrl] = html(
        `<meta property="og:title" content="Mariah Carey - Wikipedia">`,
      );
      const result = await fetchDetails(input(article));
      expect(result.details.title).toBe("Mariah Carey");
      expect(result.sources.title).toBe("page_meta");
    });
  });
});
