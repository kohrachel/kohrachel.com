import { describe, expect, test } from "bun:test";
import { titleFromShareText } from "./share-text";

describe("titleFromShareText", () => {
  test.each([
    [
      "【我的世界建筑教程-哔哩哔哩】 https://b23.tv/yIlus27",
      "https://b23.tv/yIlus27",
      "我的世界建筑教程",
    ],
    [
      "【Some Title_哔哩哔哩_bilibili】 https://b23.tv/abc",
      "https://b23.tv/abc",
      "Some Title",
    ],
    [
      "【 spaced   title 】https://example.com/x",
      "https://example.com/x",
      "spaced title",
    ],
    // Xiaohongshu's 【小红书】 comes after the link, so it isn't a title.
    [
      "54 某某发布了一篇小红书笔记，快来看吧！ 😆 AbCdEf 😆 http://xhslink.com/a/AbCdEfGh，复制本条信息，打开【小红书】App查看精彩内容！",
      "http://xhslink.com/a/AbCdEfGh",
      null,
    ],
    ["https://youtu.be/dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", null],
    ["check this out https://example.com/x", "https://example.com/x", null],
    ["【-哔哩哔哩】 https://b23.tv/abc", "https://b23.tv/abc", null],
  ])("%s", (text, url, expected) => {
    expect(titleFromShareText(text, url)).toBe(expected);
  });
});
