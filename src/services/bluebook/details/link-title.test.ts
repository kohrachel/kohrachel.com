import { describe, expect, test } from "bun:test";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { titleFromLink } from "./link-title";

describe("titleFromLink", () => {
  test.each([
    [CommonPlatform.Reddit, "https://www.reddit.com/r/sysadmin/", "r/sysadmin"],
    [
      CommonPlatform.Reddit,
      "https://www.reddit.com/user/bsodreboot26/",
      "u/bsodreboot26",
    ],
    [CommonPlatform.Reddit, "https://www.reddit.com/comments/1xwwks0/", null],
    [CommonPlatform.X, "https://x.com/jack", "@jack"],
    [CommonPlatform.X, "https://x.com/i/status/20", null],
    [CommonPlatform.Instagram, "https://www.instagram.com/natgeo/", "@natgeo"],
    [
      CommonPlatform.Instagram,
      "https://www.instagram.com/p/C1a2B3c4D5e/",
      null,
    ],
    [
      CommonPlatform.YouTube,
      "https://www.youtube.com/@veritasium",
      "@veritasium",
    ],
    [
      CommonPlatform.YouTube,
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      null,
    ],
    [CommonPlatform.LinkedIn, "https://www.linkedin.com/in/kohrh/", null],
  ])("%s %s", (platform, url, expected) => {
    expect(titleFromLink(platform, url)).toBe(expected);
  });
});
