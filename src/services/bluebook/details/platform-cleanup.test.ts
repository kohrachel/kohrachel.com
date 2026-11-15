import { describe, expect, test } from "bun:test";
import { EMPTY_DETAILS } from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { cleanPageDetails as clean } from "./platform-cleanup";

/** A link of the right kind for each platform, for tests that don't care. */
const LINKS: Record<CommonPlatform, string> = {
  [CommonPlatform.YouTube]: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  [CommonPlatform.Bilibili]: "https://www.bilibili.com/video/BV1Tyaf6FEcq",
  [CommonPlatform.X]: "https://x.com/i/status/20",
  [CommonPlatform.Xiaohongshu]:
    "https://www.xiaohongshu.com/explore/6ad2fd18000000000a02491a",
  [CommonPlatform.Instagram]: "https://www.instagram.com/p/C1a2B3c4D5e/",
  [CommonPlatform.Spotify]:
    "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl",
  [CommonPlatform.Reddit]: "https://www.reddit.com/comments/1xwwks0/",
  [CommonPlatform.Goodreads]: "https://www.goodreads.com/book/show/54493401",
  [CommonPlatform.Wikipedia]: "https://en.wikipedia.org/wiki/Mariah_Carey",
  [CommonPlatform.LinkedIn]: "https://www.linkedin.com/in/kohrh/",
};
const cleanPageDetails = (
  platform: CommonPlatform,
  details: typeof EMPTY_DETAILS,
  url = LINKS[platform],
) => clean(platform, details, url);

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
    [CommonPlatform.X, "jack (@jack) on X", "jack (@jack)"],
    [
      CommonPlatform.X,
      'jack on X: "just setting up my twttr" / X',
      'jack on X: "just setting up my twttr"',
    ],
    [
      CommonPlatform.Instagram,
      "National Geographic (@natgeo) • Instagram photos and videos",
      "National Geographic (@natgeo)",
    ],
  ])("%s: %s", (platform, title, expected) => {
    expect(cleanPageDetails(platform, details({ title }))?.title).toBe(
      expected,
    );
  });

  test("names Bilibili space pages after the uploader", () => {
    const page = details({
      title: "一起来看哲思辩论的个人空间-一起来看哲思辩论个人主页-哔哩哔哩视频",
      description: "一起来看哲思辩论的个人空间，提供…",
      thumbnailUrl: "https://i0.hdslb.com/face.jpg",
    });
    expect(
      cleanPageDetails(
        CommonPlatform.Bilibili,
        page,
        "https://space.bilibili.com/1503145643",
      ),
    ).toMatchObject({
      title: "一起来看哲思辩论",
      creator: "一起来看哲思辩论",
    });
    // A favorites folder or collection only shares the owner with the page.
    for (const url of [
      "https://space.bilibili.com/1851988793/favlist?fid=4401174493",
      "https://space.bilibili.com/520278931/lists?sid=4370876",
    ]) {
      expect(cleanPageDetails(CommonPlatform.Bilibili, page, url)).toEqual({
        ...page,
        title: null,
        creator: "一起来看哲思辩论",
        description: null,
        thumbnailUrl: null,
      });
    }
  });

  test("takes a Spotify podcast's host from its description", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Spotify,
        details({
          title: "The Joe Rogan Experience",
          description:
            "Podcast · Joe Rogan · The official podcast of comedian Joe Rogan.",
        }),
      )?.creator,
    ).toBe("Joe Rogan");
    // A track's artist comes from its music tags, not the description.
    expect(
      cleanPageDetails(
        CommonPlatform.Spotify,
        details({
          description: "Carly Rae Jepsen · Cut To The Feeling · Song · 2017",
        }),
      )?.creator,
    ).toBeNull();
  });

  test("splits an Instagram post into creator, caption and date", () => {
    const caption =
      "It started with wedding regrets. Then celebrities joined. And now… even politics?! 👀 Indonesia’s “Stop the Wedding” trend is getting more interesting by the day. #StopTheWedding #Indonesia #SocialMedi";
    expect(
      cleanPageDetails(
        CommonPlatform.Instagram,
        details({
          title: `Grace Gumala on Instagram: "${caption}`,
          description: `33 likes, 0 comments - gracegumala on November 15, 2026: "${caption.slice(0, 150)}`,
        }),
      ),
    ).toMatchObject({
      creator: "Grace Gumala",
      title:
        "It started with wedding regrets. Then celebrities joined. And now… even politics?! 👀 Indonesia’s “Stop the Wedding”…",
      description: caption.slice(0, 150),
      publishedAt: new Date("November 15, 2026").toISOString(),
    });
  });

  test("keeps a short Instagram caption whole, without the closing quote", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Instagram,
        details({
          title:
            'Comedians Interview Experts on Instagram: "OUT NOW ON YOUTUBE AND NEBULA: Alison Leiby interviews Dr. Karen Tang about menstrual health!"',
        }),
      ),
    ).toMatchObject({
      creator: "Comedians Interview Experts",
      title:
        "OUT NOW ON YOUTUBE AND NEBULA: Alison Leiby interviews Dr. Karen Tang about menstrual health!",
    });
  });

  test("names an Instagram profile and drops its follower counts", () => {
    expect(
      cleanPageDetails(
        CommonPlatform.Instagram,
        details({
          title: "Grace Gumala (@gracegumala) • Instagram photos and videos",
          description:
            "14K Followers, 1,552 Following, 1,223 Posts - See Instagram photos and videos from Grace Gumala (@gracegumala)",
        }),
        "https://www.instagram.com/gracegumala/",
      ),
    ).toMatchObject({
      title: "Grace Gumala (@gracegumala)",
      creator: "Grace Gumala",
      description: null,
    });
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
