import { describe, expect, test } from "bun:test";
import { CANONICAL_URL } from "@/domain-types/bluebook/links";
import { embedFor } from "./embed";

describe("embedFor", () => {
  test("plays YouTube videos, at their size", () => {
    expect(
      embedFor(CANONICAL_URL.youtubeVideo("lG4atCDzv0E"), {
        width: 113,
        height: 200,
      }),
    ).toEqual({
      src: "https://www.youtube-nocookie.com/embed/lG4atCDzv0E",
      width: 113,
      height: 200,
    });
  });

  test("plays Bilibili videos with danmaku, including later parts", () => {
    expect(
      embedFor(CANONICAL_URL.bilibiliVideo("BV154AwzWEje", 1), {
        playerId: "36860134114",
      }),
    ).toEqual({
      src: "https://player.bilibili.com/player.html?bvid=BV154AwzWEje&cid=36860134114&p=1&danmaku=1&autoplay=0",
      width: 16,
      height: 9,
    });
    expect(
      embedFor(CANONICAL_URL.bilibiliVideo("BV154AwzWEje", 3), {})?.src,
    ).toContain("bvid=BV154AwzWEje&p=3&");
  });

  test("doesn't play anything else", () => {
    for (const link of [
      CANONICAL_URL.youtubePlaylist("PL123"),
      CANONICAL_URL.bilibiliEpisode("123"),
      CANONICAL_URL.xPost("123"),
      "https://example.com/watch?v=lG4atCDzv0E",
    ]) {
      expect(embedFor(link, {})).toBeNull();
    }
  });
});
