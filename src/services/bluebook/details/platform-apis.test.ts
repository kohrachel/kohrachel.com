import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  BILIBILI_API,
  LINKEDIN_EMBED_URL,
} from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { html, json, installFakeNetwork } from "@/test/fake-network";
import { fetchBilibiliDetails } from "./bilibili";
import { fetchDetails } from "./fetch-details";
import { fetchLinkedInDetails } from "./linkedin";
import { fetchYouTubeDetails } from "./youtube";

const network = installFakeNetwork();

describe("YouTube Data API", () => {
  const realKey = process.env.YOUTUBE_API_KEY;
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-key";
  });
  afterEach(() => {
    if (realKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = realKey;
  });
  const api = (resource: string, params: Record<string, string>) =>
    `https://www.googleapis.com/youtube/v3/${resource}?${new URLSearchParams({ ...params, key: "test-key" })}`;

  test("reads a video's details", async () => {
    network.routes[
      api("videos", { part: "snippet,contentDetails", id: "dQw4w9WgXcQ" })
    ] = json({
      items: [
        {
          snippet: {
            title: "Never Gonna Give You Up",
            channelTitle: "Rick Astley",
            publishedAt: "2009-10-25T06:57:33Z",
            description: "The official video",
            thumbnails: {
              default: {
                url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
              },
              maxres: {
                url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
              },
            },
          },
          contentDetails: { duration: "PT3M33S" },
        },
      ],
    });
    expect(
      await fetchYouTubeDetails("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toEqual({
      title: "Never Gonna Give You Up",
      creator: "Rick Astley",
      publishedAt: "2009-10-25T06:57:33.000Z",
      description: "The official video",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      durationSeconds: 213,
    });
  });

  test("looks up channels by handle, id or username, but not /c/ names", async () => {
    const channel = (title: string) =>
      json({
        items: [{ snippet: { title, publishedAt: "2010-07-21T07:18:02Z" } }],
      });
    network.routes[
      api("channels", { part: "snippet", forHandle: "@veritasium" })
    ] = channel("Veritasium");
    network.routes[
      api("channels", { part: "snippet", id: "UCHnyfMqiRRG1u-2MsSQLbXA" })
    ] = channel("Veritasium");
    network.routes[
      api("channels", { part: "snippet", forUsername: "1veritasium" })
    ] = channel("Veritasium");

    for (const link of [
      "https://www.youtube.com/@veritasium",
      "https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA",
      "https://www.youtube.com/user/1veritasium",
    ]) {
      // A channel's creation date isn't a publish date.
      expect(await fetchYouTubeDetails(link)).toMatchObject({
        title: "Veritasium",
        creator: "Veritasium",
        publishedAt: null,
      });
    }
    expect(
      await fetchYouTubeDetails("https://www.youtube.com/c/veritasium"),
    ).toBeNull();
  });

  test("reads a playlist", async () => {
    network.routes[api("playlists", { part: "snippet", id: "PLabc123" })] =
      json({
        items: [{ snippet: { title: "Mix", channelTitle: "Someone" } }],
      });
    expect(
      await fetchYouTubeDetails(
        "https://www.youtube.com/playlist?list=PLabc123",
      ),
    ).toMatchObject({ title: "Mix", creator: "Someone" });
  });

  test("does nothing without a key, and returns null when YouTube has nothing", async () => {
    delete process.env.YOUTUBE_API_KEY;
    expect(
      await fetchYouTubeDetails("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
    expect(network.requested).toEqual([]);

    process.env.YOUTUBE_API_KEY = "test-key";
    network.routes[
      api("videos", { part: "snippet,contentDetails", id: "gone0000000" })
    ] = json({ items: [] });
    expect(
      await fetchYouTubeDetails("https://www.youtube.com/watch?v=gone0000000"),
    ).toBeNull();
  });
});

describe("Bilibili APIs", () => {
  const video = {
    code: 0,
    data: {
      title: "多P视频",
      owner: { name: "上传者" },
      pubdate: 1790776894,
      desc: "-",
      pic: "http://i0.hdslb.com/bfs/archive/cover.jpg",
      duration: 600,
      dimension: { width: 1920, height: 1080, rotate: 0 },
      pages: [
        {
          page: 1,
          part: "第一集",
          duration: 300,
          dimension: { width: 1920, height: 1080, rotate: 0 },
        },
        {
          page: 2,
          part: "第二集",
          duration: 300,
          dimension: { width: 1920, height: 1080, rotate: 1 },
        },
      ],
    },
  };

  test("reads a video, without Bilibili's '-' placeholder description", async () => {
    network.routes[BILIBILI_API.video("BV1Tyaf6FEcq")] = json(video);
    expect(
      await fetchBilibiliDetails("https://www.bilibili.com/video/BV1Tyaf6FEcq"),
    ).toEqual({
      title: "多P视频",
      creator: "上传者",
      publishedAt: new Date(1790776894 * 1000).toISOString(),
      description: null,
      thumbnailUrl: "https://i0.hdslb.com/bfs/archive/cover.jpg",
      durationSeconds: 600,
      width: 1920,
      height: 1080,
    });
  });

  test("reads one part of a multi-part video, swapping a rotated size", async () => {
    network.routes[BILIBILI_API.video("BV1Tyaf6FEcq")] = json(video);
    expect(
      await fetchBilibiliDetails(
        "https://www.bilibili.com/video/BV1Tyaf6FEcq?p=2",
      ),
    ).toMatchObject({
      title: "多P视频 - 第二集",
      durationSeconds: 300,
      width: 1080,
      height: 1920,
    });
  });

  test("reads an anime episode and its season", async () => {
    const season = json({
      code: 0,
      result: {
        title: "凡人修仙传",
        evaluate: "看机智的凡人小子韩立如何稳健发展",
        cover: "https://i0.hdslb.com/bfs/bangumi/image/season.png",
        publish: { pub_time: "2020-07-25 20:00:00" },
        episodes: [
          {
            id: 733316,
            show_title: "第1话 凡人风起天南1重制版",
            pub_time: 1675566000,
            duration: 1203160,
            cover: "http://i0.hdslb.com/bfs/archive/episode.jpg",
            dimension: { width: 1920, height: 1080, rotate: 0 },
          },
        ],
      },
    });
    network.routes[BILIBILI_API.season("ep_id", "733316")] = season;
    network.routes[BILIBILI_API.season("season_id", "28747")] = season;

    expect(
      await fetchBilibiliDetails(
        "https://www.bilibili.com/bangumi/play/ep733316",
      ),
    ).toEqual({
      title: "凡人修仙传 第1话 凡人风起天南1重制版",
      publishedAt: "2023-02-05T03:00:00.000Z",
      description: "看机智的凡人小子韩立如何稳健发展",
      thumbnailUrl: "https://i0.hdslb.com/bfs/archive/episode.jpg",
      durationSeconds: 1203,
      width: 1920,
      height: 1080,
    });
    expect(
      await fetchBilibiliDetails(
        "https://www.bilibili.com/bangumi/play/ss28747",
      ),
    ).toMatchObject({
      title: "凡人修仙传",
      publishedAt: "2020-07-25T12:00:00.000Z",
    });
  });

  test("reads a long series' response past the usual JSON limit", async () => {
    const episodes = Array.from({ length: 4000 }, (_, i) => ({
      id: i + 1,
      show_title: `第${i + 1}话 ${"很长的标题".repeat(20)}`,
      pub_time: 1675566000,
    }));
    network.routes[BILIBILI_API.season("ep_id", "4000")] = json({
      code: 0,
      result: { title: "长篇", episodes },
    });
    expect(
      await fetchBilibiliDetails(
        "https://www.bilibili.com/bangumi/play/ep4000",
      ),
    ).toMatchObject({ title: expect.stringContaining("长篇 第4000话") });
  });

  test("reads a favorites folder", async () => {
    network.routes[BILIBILI_API.favorites("4401174493")] = json({
      code: 0,
      data: {
        title: "默认收藏夹",
        upper: { name: "rkchell" },
        intro: "",
        cover: "http://i2.hdslb.com/f.jpg",
      },
    });
    expect(
      await fetchBilibiliDetails(
        "https://space.bilibili.com/1851988793/favlist?fid=4401174493",
      ),
    ).toEqual({
      title: "默认收藏夹",
      creator: "rkchell",
      description: null,
      thumbnailUrl: "https://i2.hdslb.com/f.jpg",
    });
  });

  test("returns null when Bilibili refuses, and for spaces and collections", async () => {
    network.routes[BILIBILI_API.video("BV1Tyaf6FEcq")] = json({
      code: -352,
      data: null,
    });
    expect(
      await fetchBilibiliDetails("https://www.bilibili.com/video/BV1Tyaf6FEcq"),
    ).toBeNull();
    for (const link of [
      "https://space.bilibili.com/1503145643",
      "https://space.bilibili.com/520278931/lists?sid=4370876",
    ]) {
      expect(await fetchBilibiliDetails(link)).toBeNull();
    }
  });
});

describe("LinkedIn embed", () => {
  const urn = "urn:li:activity:7497938302063235073";
  const embed = html(`<head>
    <title>So it's internship season… | Rachel Koh</title>
    <meta property="og:title" content="So it's internship season… | Rachel Koh">
    <meta property="og:description" content="So it's internship season (when is it not?) and we want to share how.">
    <meta property="og:image" content="https://media.licdn.com/post.jpg">
  </head>`);

  test("reads a post's text and author", async () => {
    network.routes[LINKEDIN_EMBED_URL(urn)] = embed;
    expect(
      await fetchLinkedInDetails(
        `https://www.linkedin.com/feed/update/${urn}/`,
      ),
    ).toMatchObject({
      title: "So it's internship season…",
      creator: "Rachel Koh",
      description:
        "So it's internship season (when is it not?) and we want to share how.",
      thumbnailUrl: "https://media.licdn.com/post.jpg",
    });
  });

  test("returns null for posts that can't be embedded, and doesn't try comments", async () => {
    network.routes[LINKEDIN_EMBED_URL(urn)] = () =>
      new Response("<title>LinkedIn</title>", {
        status: 404,
        headers: { "content-type": "text/html" },
      });
    expect(
      await fetchLinkedInDetails(
        `https://www.linkedin.com/feed/update/${urn}/`,
      ),
    ).toBeNull();

    network.requested.length = 0;
    expect(
      await fetchLinkedInDetails(
        `https://www.linkedin.com/feed/update/${urn}/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A(1%2C${urn})`,
      ),
    ).toBeNull();
    expect(network.requested).toEqual([]);
  });
});

describe("fetchDetails with platform APIs", () => {
  test("prefers the API, and dates a LinkedIn post from its id when the embed fails", async () => {
    const link =
      "https://www.linkedin.com/feed/update/urn:li:share:7479935058749902848/";
    const result = await fetchDetails({
      url: "https://lnkd.in/p/gZh9EeEp",
      resolvedUrl: link,
      normalizedUrl: link,
      commonPlatform: CommonPlatform.LinkedIn,
      pastedText: "https://lnkd.in/p/gZh9EeEp",
    });
    expect(result.details.publishedAt).toBe("2026-07-06T16:31:28.479Z");
    expect(result.sources).toEqual({ publishedAt: "link" });
  });
});
