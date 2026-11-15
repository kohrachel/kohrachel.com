import { describe, expect, test } from "bun:test";
import { EMPTY_DETAILS } from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { cleanPageDetails } from "./platform-cleanup";

const details = (overrides: Partial<typeof EMPTY_DETAILS>) => ({
  ...EMPTY_DETAILS,
  ...overrides,
});

describe("cleanPageDetails", () => {
  test("removes Bilibili's title suffix and view counts", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Bilibili,
        details({
          title:
            "什么才是真正的爱自己？如何理解“你要先爱自己，才会有人来爱你”_哔哩哔哩_bilibili",
          description:
            "我们总在追问，什么是真正的爱自己, 视频播放量 69998、弹幕量 5、点赞数 4649、投硬币枚数 29",
        }),
      ),
    ).toMatchObject({
      title: "什么才是真正的爱自己？如何理解“你要先爱自己，才会有人来爱你”",
      description: "我们总在追问，什么是真正的爱自己",
    });
  });

  test("drops Bilibili's empty description placeholder", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Bilibili,
        details({ description: "-, 视频播放量 69998、弹幕量 5" }),
      )?.description,
    ).toBeNull();
  });

  test.each([
    [
      CommonPlatform.YouTube,
      "Never Gonna Give You Up - YouTube",
      "Never Gonna Give You Up",
    ],
    [CommonPlatform.Wikipedia, "Mariah Carey - Wikipedia", "Mariah Carey"],
    [
      CommonPlatform.Wikipedia,
      "瑪麗亞·凱莉 - 維基百科，自由的百科全書",
      "瑪麗亞·凱莉",
    ],
    [
      CommonPlatform.Goodreads,
      "Project Hail Mary by Andy Weir | Goodreads",
      "Project Hail Mary",
    ],
    [
      CommonPlatform.LinkedIn,
      "What stores tell you | LinkedIn",
      "What stores tell you",
    ],
    [
      CommonPlatform.Spotify,
      "Cut To The Feeling | Spotify",
      "Cut To The Feeling",
    ],
    [CommonPlatform.Reddit, "Reddit", null],
  ])("%s: %s", (platform, title, expected) => {
    expect(cleanPageDetails(platform, details({ title }))?.title).toBe(
      expected,
    );
  });

  test.each([
    "Sign Up | LinkedIn",
    "LinkedIn Login, Sign in | LinkedIn",
    "Log in - rednote - share, connect, love",
    "Login • Instagram",
    "登录 - 小红书",
  ])("treats %s as a login page", (title) => {
    expect(
      cleanPageDetails(CommonPlatform.LinkedIn, details({ title })),
    ).toBeNull();
  });

  test("keeps titles that only mention signing up", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Reddit,
        details({ title: "Why I didn't sign up for the marathon" }),
      )?.title,
    ).toBe("Why I didn't sign up for the marathon");
  });
});
