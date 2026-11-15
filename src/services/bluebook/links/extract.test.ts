import { describe, expect, test } from "bun:test";
import { extractUrl } from "./extract";

const cases: [string, string | null][] = [
  [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  ["  https://youtu.be/dQw4w9WgXcQ  \n", "https://youtu.be/dQw4w9WgXcQ"],
  ["youtu.be/dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ"],
  ["www.example.com/post", "https://www.example.com/post"],
  ["【标题】 https://b23.tv/AbC1234", "https://b23.tv/AbC1234"],
  [
    "54 某某发布了一篇小红书笔记，快来看吧！ 😆 AbCdEf 😆 http://xhslink.com/a/AbCdEfGh，复制本条信息，打开【小红书】App查看精彩内容！",
    "http://xhslink.com/a/AbCdEfGh",
  ],
  ["Check this out (https://example.com/a).", "https://example.com/a"],
  [
    "see https://en.wikipedia.org/wiki/Goldfish_(disambiguation).",
    "https://en.wikipedia.org/wiki/Goldfish_(disambiguation)",
  ],
  ["first https://a.com/1 then https://b.com/2", "https://a.com/1"],
  ["“https://example.com/quoted”", "https://example.com/quoted"],
  ["no link here", null],
  ["", null],
  ["just some words.com and more", null],
];

describe("extractUrl", () => {
  test.each(cases)("%p", (input, expected) => {
    expect(extractUrl(input)).toBe(expected);
  });
});
