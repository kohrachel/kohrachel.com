import { describe, expect, test } from "bun:test";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { normalizeUrl } from "./normalize";

const {
  YouTube,
  Bilibili,
  X,
  Xiaohongshu,
  Instagram,
  Spotify,
  Reddit,
  Goodreads,
  Wikipedia,
  LinkedIn,
} = CommonPlatform;

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

  // Reddit (the /s/ share links redirect to the first two)
  [
    "https://www.reddit.com/r/sysadmin/comments/1xwwks0/root_cause_of_faa_shutdown_newly_installed_hpe/",
    Reddit,
    "https://www.reddit.com/comments/1xwwks0/",
  ],
  [
    "https://www.reddit.com/r/sysadmin/comments/1xwwks0/root_cause_of_faa_shutdown_newly_installed_hpe/?share_id=nE5DtKJdmi0c_QSvOV5kA&utm_content=share_button&utm_medium=web3x&utm_name=web3xcss&utm_source=share&utm_term=1",
    Reddit,
    "https://www.reddit.com/comments/1xwwks0/",
  ],
  [
    "https://old.reddit.com/r/sysadmin/comments/1xwwks0/",
    Reddit,
    "https://www.reddit.com/comments/1xwwks0/",
  ],
  [
    "https://redd.it/1xwwks0",
    Reddit,
    "https://www.reddit.com/comments/1xwwks0/",
  ],
  [
    "https://www.reddit.com/r/it/comments/1xvqpal/comment/19sly67zdi6v4/",
    Reddit,
    "https://www.reddit.com/comments/1xvqpal/comment/19sly67zdi6v4/",
  ],
  [
    "https://www.reddit.com/r/it/comments/1xvqpal/comment/19sly67zdi6v4/?share_id=3YgJeG8OOGXwDVRzQzkNZ&utm_source=share",
    Reddit,
    "https://www.reddit.com/comments/1xvqpal/comment/19sly67zdi6v4/",
  ],
  [
    "https://www.reddit.com/r/it/comments/1xvqpal/some_title/19sly67zdi6v4/",
    Reddit,
    "https://www.reddit.com/comments/1xvqpal/comment/19sly67zdi6v4/",
  ],
  [
    "https://www.reddit.com/r/SysAdmin/",
    Reddit,
    "https://www.reddit.com/r/sysadmin/",
  ],
  [
    "https://www.reddit.com/u/SomeOne",
    Reddit,
    "https://www.reddit.com/user/someone/",
  ],

  // Goodreads (each edition of a book has its own id)
  [
    "https://www.goodreads.com/book/show/54493401-project-hail-mary",
    Goodreads,
    "https://www.goodreads.com/book/show/54493401",
  ],
  [
    "https://www.goodreads.com/book/show/222697645-project-hail-mary",
    Goodreads,
    "https://www.goodreads.com/book/show/222697645",
  ],
  [
    "https://www.goodreads.com/book/show/1513773",
    Goodreads,
    "https://www.goodreads.com/book/show/1513773",
  ],
  [
    "https://www.goodreads.com/book/show/54493401.Project_Hail_Mary?from_search=true",
    Goodreads,
    "https://www.goodreads.com/book/show/54493401",
  ],
  [
    "https://www.goodreads.com/author/show/10657.Enid_Blyton",
    Goodreads,
    "https://www.goodreads.com/author/show/10657",
  ],
  [
    "https://www.goodreads.com/author/show/7025402.____________",
    Goodreads,
    "https://www.goodreads.com/author/show/7025402",
  ],
  [
    "https://www.goodreads.com/series/43865-the-naughtiest-girl",
    Goodreads,
    "https://www.goodreads.com/series/43865",
  ],

  // Wikipedia (w.wiki/3hPF and w.wiki/_zLen redirect to the first one)
  [
    "https://en.wikipedia.org/wiki/Mariah_Carey",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Mariah_Carey",
  ],
  [
    "https://en.wikipedia.org/wiki/Mariah_Carey?wprov=shhu0",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Mariah_Carey",
  ],
  [
    "https://en.m.wikipedia.org/wiki/Mariah_Carey#Early_life",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Mariah_Carey",
  ],
  [
    "https://en.wikipedia.org/wiki/mariah Carey",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Mariah_Carey",
  ],
  [
    "https://en.wikipedia.org/w/index.php?title=Mariah_Carey",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Mariah_Carey",
  ],
  [
    "https://en.wikipedia.org/wiki/Goldfish_(disambiguation)",
    Wikipedia,
    "https://en.wikipedia.org/wiki/Goldfish_(disambiguation)",
  ],
  [
    "https://zh.wikipedia.org/wiki/%E7%91%AA%E9%BA%97%E4%BA%9E%C2%B7%E5%87%B1%E8%8E%89",
    Wikipedia,
    "https://zh.wikipedia.org/wiki/%E7%91%AA%E9%BA%97%E4%BA%9E%C2%B7%E5%87%B1%E8%8E%89",
  ],
  [
    "https://zh.wikipedia.org/wiki/瑪麗亞·凱莉",
    Wikipedia,
    "https://zh.wikipedia.org/wiki/%E7%91%AA%E9%BA%97%E4%BA%9E%C2%B7%E5%87%B1%E8%8E%89",
  ],
  [
    "https://zh.m.wikipedia.org/zh-hans/%E7%91%AA%E9%BA%97%E4%BA%9E%C2%B7%E5%87%B1%E8%8E%89",
    Wikipedia,
    "https://zh.wikipedia.org/wiki/%E7%91%AA%E9%BA%97%E4%BA%9E%C2%B7%E5%87%B1%E8%8E%89",
  ],

  // LinkedIn (lnkd.in/p/… share links redirect to the post, repost and comment links)
  [
    "https://www.linkedin.com/in/kohrh/",
    LinkedIn,
    "https://www.linkedin.com/in/kohrh/",
  ],
  [
    "https://www.linkedin.com/in/KohRH?trk=public_profile",
    LinkedIn,
    "https://www.linkedin.com/in/kohrh/",
  ],
  [
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/",
    LinkedIn,
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/",
  ],
  [
    "https://www.linkedin.com/posts/saydolim_what-stores-tell-you-that-pos-cannot-share-7479935058749902848-Xjys/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAD5_V6ABHQHxs1WhDoBFQfwrWn61mtuft28",
    LinkedIn,
    "https://www.linkedin.com/feed/update/urn:li:share:7479935058749902848/",
  ],
  [
    "https://www.linkedin.com/feed/update/urn:li:activity:7479935996336312320/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD5_V6ABHQHxs1WhDoBFQfwrWn61mtuft28",
    LinkedIn,
    "https://www.linkedin.com/feed/update/urn:li:activity:7479935996336312320/",
  ],
  [
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287497940407838720001%2Curn%3Ali%3Aactivity%3A7497938302063235073%29",
    LinkedIn,
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A(7497940407838720001%2Curn%3Ali%3Aactivity%3A7497938302063235073)",
  ],
  [
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7497938302063235073%2C7497940407838720001%29",
    LinkedIn,
    "https://www.linkedin.com/feed/update/urn:li:activity:7497938302063235073/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A(7497940407838720001%2Curn%3Ali%3Aactivity%3A7497938302063235073)",
  ],
  [
    "https://www.linkedin.com/company/anthropicresearch/about/",
    LinkedIn,
    "https://www.linkedin.com/company/anthropicresearch/",
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
  ["https://www.reddit.com/", Reddit],
  ["https://www.reddit.com/r/sysadmin/s/iZTpMU7Rs5", Reddit],
  ["https://www.goodreads.com/", Goodreads],
  ["https://www.goodreads.com/search?q=hail+mary", Goodreads],
  ["https://en.wikipedia.org/", Wikipedia],
  ["https://w.wiki/3hPF", Wikipedia],
  ["https://www.linkedin.com/feed/", LinkedIn],
  ["https://lnkd.in/p/gZh9EeEp", LinkedIn],
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
        expect(
          platform === commonPlatform ||
            platform.endsWith(`.${commonPlatform}`),
        ).toBe(true);
      }
    },
  );
});
