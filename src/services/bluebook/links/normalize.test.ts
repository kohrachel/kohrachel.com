import { describe, expect, test } from "bun:test";
import {
  COMMON_PLATFORM_HOSTS,
  CommonPlatform,
} from "@/domain-types/bluebook/links";
import { normalizeUrl } from "./normalize";

const { YouTube, Bilibili, X, Xiaohongshu, Instagram, Spotify } =
  CommonPlatform;

const accepted: [string, CommonPlatform | null, string][] = [
  // YouTube videos
  [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://youtu.be/dQw4w9WgXcQ?si=AbCdEf123&t=42",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share&pp=ygU",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://www.youtube.com/watch?app=desktop&v=dQw4w9WgXcQ&list=PL123&index=3&t=1m2s",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://youtube.com/shorts/aBcDeFgHiJk?si=xyz",
    YouTube,
    "https://www.youtube.com/watch?v=aBcDeFgHiJk",
  ],
  [
    "https://www.youtube.com/embed/dQw4w9WgXcQ?start=30",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://www.youtube.com/live/aBcDeFgHiJk?feature=share",
    YouTube,
    "https://www.youtube.com/watch?v=aBcDeFgHiJk",
  ],
  [
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=abc",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  [
    "http://WWW.YouTube.com/watch?v=dQw4w9WgXcQ#comments",
    YouTube,
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ],
  // YouTube playlists and channels
  [
    "https://www.youtube.com/playlist?list=PLabc123&si=xyz",
    YouTube,
    "https://www.youtube.com/playlist?list=PLabc123",
  ],
  [
    "https://www.youtube.com/@Veritasium/videos?si=xyz",
    YouTube,
    "https://www.youtube.com/@veritasium",
  ],
  [
    "https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA",
    YouTube,
    "https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA",
  ],
  [
    "https://www.youtube.com/c/veritasium/featured",
    YouTube,
    "https://www.youtube.com/c/veritasium",
  ],

  // Bilibili videos
  [
    "https://www.bilibili.com/video/BV1GJ411x7h7/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=abc123",
    Bilibili,
    "https://www.bilibili.com/video/BV1GJ411x7h7",
  ],
  [
    "https://m.bilibili.com/video/BV1GJ411x7h7?share_source=copy_web&share_medium=iphone&t=95",
    Bilibili,
    "https://www.bilibili.com/video/BV1GJ411x7h7",
  ],
  [
    "https://www.bilibili.com/video/BV1GJ411x7h7?p=1",
    Bilibili,
    "https://www.bilibili.com/video/BV1GJ411x7h7",
  ],
  [
    "https://www.bilibili.com/video/BV1GJ411x7h7/?p=3&share_source=copy_web",
    Bilibili,
    "https://www.bilibili.com/video/BV1GJ411x7h7?p=3",
  ],
  [
    "https://www.bilibili.com/video/av170001/",
    Bilibili,
    "https://www.bilibili.com/video/BV17x411w7KC",
  ],
  // Copied from the browser's address bar
  [
    "https://www.bilibili.com/zh-Hans/video/BV1bZ9aBGEA2/?spm_id_from=333.788.recommend_more_video.3&trackid=web_related_0.router-related-2479604-tdxs9.1794625119942.158&vd_source=c404db0b1cbaeed61aefc29b437240e3",
    Bilibili,
    "https://www.bilibili.com/video/BV1bZ9aBGEA2",
  ],
  // Where b23.tv/yIlus27 redirects to
  [
    "https://www.bilibili.com/en/video/BV1Tyaf6FEcq?buvid=Y842058B6717B23F4C6E9867A223B0298465&is_story_h5=false&mid=eaonb0CmlBkuehR1X7oVhA%3D%3D&p=1&plat_id=245&share_from=ugc&share_medium=iphone_i&share_plat=ios&share_session_id=509BE42B-3C8B-437A-8F46-A124AA996E18&share_source=COPY&share_tag=s_i&spmid=tm.recommend.ugc.0&timestamp=1794760890&unique_k=yIlus27&up_id=1503145643",
    Bilibili,
    "https://www.bilibili.com/video/BV1Tyaf6FEcq",
  ],
  // Bilibili episodes, spaces, favorites and collections
  [
    "https://www.bilibili.com/bangumi/play/ep123456?from_spmid=666.25&trackid=web_related_0.router",
    Bilibili,
    "https://www.bilibili.com/bangumi/play/ep123456",
  ],
  [
    "https://www.bilibili.com/bangumi/play/ss28747",
    Bilibili,
    "https://www.bilibili.com/bangumi/play/ss28747",
  ],
  [
    "https://space.bilibili.com/1503145643?spm_id_from=333.788",
    Bilibili,
    "https://space.bilibili.com/1503145643",
  ],
  [
    "https://space.bilibili.com/1503145643/video",
    Bilibili,
    "https://space.bilibili.com/1503145643",
  ],
  [
    "https://m.bilibili.com/space/1503145643",
    Bilibili,
    "https://space.bilibili.com/1503145643",
  ],
  [
    "https://space.bilibili.com/zh-Hans/1851988793/favlist?fid=4401174493&ftype=create&spm_id_from=333.788.0.0",
    Bilibili,
    "https://space.bilibili.com/1851988793/favlist?fid=4401174493",
  ],
  [
    "https://space.bilibili.com/zh-Hans/520278931/lists?sid=4370876&spm_id_from=333.788.0.0",
    Bilibili,
    "https://space.bilibili.com/520278931/lists?sid=4370876",
  ],
  [
    "https://space.bilibili.com/520278931/lists/4370876?type=season",
    Bilibili,
    "https://space.bilibili.com/520278931/lists?sid=4370876",
  ],

  // X
  [
    "https://x.com/someone/status/1790000000000000000?s=46&t=AbCdEf",
    X,
    "https://x.com/i/status/1790000000000000000",
  ],
  [
    "https://twitter.com/someone/status/1790000000000000000/photo/1",
    X,
    "https://x.com/i/status/1790000000000000000",
  ],
  [
    "https://mobile.twitter.com/someone/status/1790000000000000000",
    X,
    "https://x.com/i/status/1790000000000000000",
  ],
  [
    "https://x.com/i/web/status/1790000000000000000",
    X,
    "https://x.com/i/status/1790000000000000000",
  ],
  ["https://twitter.com/SomeOne?s=21", X, "https://x.com/someone"],
  ["https://x.com/someone/with_replies", X, "https://x.com/someone"],

  // Xiaohongshu
  [
    "https://www.xiaohongshu.com/explore/65a1b2c3d4e5f6a7b8c9d0e1?xsec_token=ABxyz&xsec_source=pc_feed",
    Xiaohongshu,
    "https://www.xiaohongshu.com/explore/65a1b2c3d4e5f6a7b8c9d0e1",
  ],
  [
    "https://www.xiaohongshu.com/discovery/item/65a1b2c3d4e5f6a7b8c9d0e1?app_platform=ios&share_from_user_hidden=true",
    Xiaohongshu,
    "https://www.xiaohongshu.com/explore/65a1b2c3d4e5f6a7b8c9d0e1",
  ],
  [
    "https://www.xiaohongshu.com/user/profile/5f0000000000000000000001/65a1b2c3d4e5f6a7b8c9d0e1",
    Xiaohongshu,
    "https://www.xiaohongshu.com/explore/65a1b2c3d4e5f6a7b8c9d0e1",
  ],
  // Where xhslink.com/m/5JEPyYmWHuS redirects to
  [
    "https://www.xiaohongshu.com/discovery/item/6ad2fd18000000000a02491a?app_platform=ios&app_version=9.54.2&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token=CBwsxA7326B5RmTffSetJ7ChYqry0O0dxGHdTdiheST4Q=&author_share=1&xhsshare=system_share&shareRedId=ODo5NUQ8Rzo2NzUyOTgwNjczOTo6SjpC&apptime=1794537905&share_id=47246738a22144248e1260af4b7a6f5e",
    Xiaohongshu,
    "https://www.xiaohongshu.com/explore/6ad2fd18000000000a02491a",
  ],
  [
    "https://www.xiaohongshu.com/user/profile/5f0000000000000000000001?xsec_token=abc",
    Xiaohongshu,
    "https://www.xiaohongshu.com/user/profile/5f0000000000000000000001",
  ],

  // Instagram
  [
    "https://www.instagram.com/p/C1a2B3c4D5e/?igsh=MTc4MmM1YmI2Ng==",
    Instagram,
    "https://www.instagram.com/p/C1a2B3c4D5e/",
  ],
  [
    "https://instagram.com/reel/C1a2B3c4D5e/?utm_source=ig_web_copy_link",
    Instagram,
    "https://www.instagram.com/p/C1a2B3c4D5e/",
  ],
  [
    "https://www.instagram.com/someone/p/C1a2B3c4D5e/",
    Instagram,
    "https://www.instagram.com/p/C1a2B3c4D5e/",
  ],
  [
    "https://www.instagram.com/Some.One/?igsh=abc",
    Instagram,
    "https://www.instagram.com/some.one/",
  ],

  // Spotify
  [
    "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk?si=abc123",
    Spotify,
    "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk",
  ],
  [
    "https://open.spotify.com/intl-ja/episode/4rOoJ6Egrf8K2IrywzwOMk",
    Spotify,
    "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk",
  ],
  [
    "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl?si=x&context=spotify%3Aplaylist%3A37i9",
    Spotify,
    "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl",
  ],
  [
    "https://open.spotify.com/embed/show/5CfCWKI5pZ28U0uOzXkDHe",
    Spotify,
    "https://open.spotify.com/show/5CfCWKI5pZ28U0uOzXkDHe",
  ],
  [
    "https://open.spotify.com/user/some.user_1?si=x",
    Spotify,
    "https://open.spotify.com/user/some.user_1",
  ],

  // Any other site
  [
    "https://www.example.com/blog/post/?utm_source=newsletter&utm_medium=email&fbclid=IwAR0",
    null,
    "https://example.com/blog/post",
  ],
  [
    "http://Example.com/Path/Case?b=2&a=1#section-3",
    null,
    "https://example.com/Path/Case?a=1&b=2",
  ],
  ["https://example.com/", null, "https://example.com/"],
  [
    "https://news.ycombinator.com/item?id=12345",
    null,
    "https://news.ycombinator.com/item?id=12345",
  ],
  [
    "https://en.wikipedia.org/wiki/Goldfish_(disambiguation)",
    null,
    "https://en.wikipedia.org/wiki/Goldfish_(disambiguation)",
  ],
  ["https://m.example.com/article", null, "https://m.example.com/article"],
];

const rejected: [string, CommonPlatform][] = [
  ["https://www.youtube.com/", YouTube],
  ["https://www.youtube.com/results?search_query=goldfish", YouTube],
  ["https://www.youtube.com/feed/subscriptions", YouTube],
  ["https://www.bilibili.com/", Bilibili],
  [
    "https://www.bilibili.com/zh-Hans/watchlater/list?spm_id_from=333.788.0.0",
    Bilibili,
  ],
  ["https://b23.tv/AbC1234", Bilibili],
  ["https://x.com/home", X],
  ["https://x.com/search?q=goldfish", X],
  ["https://www.xiaohongshu.com/explore", Xiaohongshu],
  ["https://xhslink.com/a/AbCdEfGh", Xiaohongshu],
  ["https://www.instagram.com/explore/", Instagram],
  ["https://www.instagram.com/stories/someone/1234/", Instagram],
  ["https://open.spotify.com/", Spotify],
  ["https://open.spotify.com/search/goldfish", Spotify],
];

/** Mirrors the generated `items.platform` column and its check in Postgres. */
function databasePlatform(normalizedUrl: string) {
  expect(normalizedUrl).toMatch(/^https:\/\/[a-z0-9.-]+(:[0-9]+)?\//);
  const host = normalizedUrl.match(/^https:\/\/([^/?#:]+)/)![1];
  return host.replace(/^www\./, "");
}

describe("normalizeUrl", () => {
  test.each(accepted)("%s", (input, commonPlatform, normalizedUrl) => {
    expect(normalizeUrl(input)).toEqual({
      ok: true,
      normalizedUrl,
      commonPlatform,
    });
  });

  test.each(rejected)("rejects %s", (input, commonPlatform) => {
    expect(normalizeUrl(input)).toEqual({
      ok: false,
      reason: "unsupported_page",
      commonPlatform,
    });
  });

  test.each(accepted)(
    "stores a platform the database accepts: %s",
    (input, commonPlatform) => {
      const result = normalizeUrl(input);
      if (!result.ok) throw new Error("expected ok");
      const platform = databasePlatform(result.normalizedUrl);
      if (commonPlatform) {
        expect(COMMON_PLATFORM_HOSTS[commonPlatform]).toContain(platform);
      }
    },
  );
});
