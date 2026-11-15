import { describe, expect, test } from "bun:test";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { detailsFromLink } from "./link-details";

describe("detailsFromLink", () => {
  test.each([
    [
      CommonPlatform.Reddit,
      "https://www.reddit.com/r/sysadmin/",
      { title: "r/sysadmin" },
    ],
    [
      CommonPlatform.Reddit,
      "https://www.reddit.com/user/bsodreboot26/",
      { title: "u/bsodreboot26" },
    ],
    [CommonPlatform.Reddit, "https://www.reddit.com/comments/1xwwks0/", {}],
    [CommonPlatform.X, "https://x.com/jack", { title: "@jack" }],
    [
      CommonPlatform.Instagram,
      "https://www.instagram.com/natgeo/",
      { title: "@natgeo" },
    ],
    [CommonPlatform.Instagram, "https://www.instagram.com/p/C1a2B3c4D5e/", {}],
    [
      CommonPlatform.YouTube,
      "https://www.youtube.com/@veritasium",
      { title: "@veritasium" },
    ],
    [CommonPlatform.YouTube, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", {}],
    [
      CommonPlatform.Goodreads,
      "https://www.goodreads.com/book/show/54493401",
      {},
    ],
  ])("%s %s", (platform, url, expected) => {
    expect(detailsFromLink(platform, url)).toEqual(expected);
  });

  test("dates LinkedIn posts and comments from their ids", () => {
    // LinkedIn shows the first as "2mo" on Nov 15, 2026; the repost was made
    // four minutes after the post it shares.
    expect(
      detailsFromLink(
        CommonPlatform.LinkedIn,
        "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/",
      ),
    ).toEqual({ publishedAt: "2026-08-25T08:49:56.169Z" });
    expect(
      detailsFromLink(
        CommonPlatform.LinkedIn,
        "https://www.linkedin.com/feed/update/urn:li:share:7479935058749902848/",
      ).publishedAt,
    ).toBe("2026-07-06T16:31:28.479Z");
    expect(
      detailsFromLink(
        CommonPlatform.LinkedIn,
        "https://www.linkedin.com/feed/update/urn:li:activity:7479935996336312320/",
      ).publishedAt,
    ).toBe("2026-07-06T16:35:12.017Z");
    // A comment is dated by its own id, after the post's.
    const comment = detailsFromLink(
      CommonPlatform.LinkedIn,
      "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A(7497940407838720001%2Curn%3Ali%3Aactivity%3A7497938302063235073)",
    ).publishedAt!;
    expect(comment > "2026-08-25T08:49:56.169Z").toBe(true);
    expect(
      detailsFromLink(
        CommonPlatform.LinkedIn,
        "https://www.linkedin.com/in/kohrh/",
      ),
    ).toEqual({});
  });

  test("dates X posts from their ids, except ones from before 2010", () => {
    const posted = Date.UTC(2022, 3, 28, 12, 0, 0);
    const id = (BigInt(posted - 1288834974657) << BigInt(22)) + BigInt(12345);
    expect(
      detailsFromLink(CommonPlatform.X, `https://x.com/i/status/${id}`)
        .publishedAt,
    ).toBe("2022-04-28T12:00:00.000Z");
    expect(
      detailsFromLink(CommonPlatform.X, "https://x.com/i/status/20")
        .publishedAt,
    ).toBeNull();
  });
});
