/**
 * Platforms the app has its own code for: link formats (several addresses for
 * one page), fetching details, or display (name, embed, card). Any other site
 * still works, with general cleanup. Add a platform here when code needs to
 * treat it differently, not because it's popular.
 *
 * Each value is a domain. The `items.platform` the database generates for a
 * common platform's pages is that domain or one of its subdomains, such as
 * `space.bilibili.com` or `zh.wikipedia.org`.
 */
export enum CommonPlatform {
  YouTube = "youtube.com",
  Bilibili = "bilibili.com",
  X = "x.com",
  Xiaohongshu = "xiaohongshu.com",
  Instagram = "instagram.com",
  Spotify = "spotify.com",
  Reddit = "reddit.com",
  Goodreads = "goodreads.com",
  Wikipedia = "wikipedia.org",
  LinkedIn = "linkedin.com",
}

export const COMMON_PLATFORM_NAMES: Record<CommonPlatform, string> = {
  [CommonPlatform.YouTube]: "YouTube",
  [CommonPlatform.Bilibili]: "Bilibili",
  [CommonPlatform.X]: "X",
  [CommonPlatform.Xiaohongshu]: "Xiaohongshu",
  [CommonPlatform.Instagram]: "Instagram",
  [CommonPlatform.Spotify]: "Spotify",
  [CommonPlatform.Reddit]: "Reddit",
  [CommonPlatform.Goodreads]: "Goodreads",
  [CommonPlatform.Wikipedia]: "Wikipedia",
  [CommonPlatform.LinkedIn]: "LinkedIn",
};

/**
 * Hosts whose links belong to each platform, without a leading `www.`.
 * Includes short-link hosts. `*.` matches any subdomain.
 */
export const COMMON_PLATFORM_HOSTS: Record<CommonPlatform, readonly string[]> =
  {
    [CommonPlatform.YouTube]: [
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
      "youtu.be",
    ],
    [CommonPlatform.Bilibili]: [
      "bilibili.com",
      "m.bilibili.com",
      "space.bilibili.com",
      "b23.tv",
      "bili2233.cn",
    ],
    [CommonPlatform.X]: ["x.com", "twitter.com", "mobile.twitter.com"],
    [CommonPlatform.Xiaohongshu]: ["xiaohongshu.com", "xhslink.com"],
    [CommonPlatform.Instagram]: ["instagram.com"],
    [CommonPlatform.Spotify]: [
      "open.spotify.com",
      "play.spotify.com",
      "spotify.link",
      "spoti.fi",
    ],
    [CommonPlatform.Reddit]: [
      "reddit.com",
      "old.reddit.com",
      "new.reddit.com",
      "np.reddit.com",
      "m.reddit.com",
      "redd.it",
    ],
    [CommonPlatform.Goodreads]: ["goodreads.com", "m.goodreads.com"],
    [CommonPlatform.Wikipedia]: ["*.wikipedia.org", "w.wiki"],
    [CommonPlatform.LinkedIn]: ["linkedin.com", "lnkd.in"],
  };

/**
 * The one link each kind of page on a common platform resolves to. Pages on a
 * common platform that match none of these are rejected.
 */
export const CANONICAL_URL = {
  youtubeVideo: (id: string) => `https://www.youtube.com/watch?v=${id}`,
  youtubePlaylist: (id: string) =>
    `https://www.youtube.com/playlist?list=${id}`,
  youtubeHandle: (handle: string) => `https://www.youtube.com/@${handle}`,
  youtubeChannel: (id: string) => `https://www.youtube.com/channel/${id}`,
  youtubeLegacyChannel: (kind: "c" | "user", name: string) =>
    `https://www.youtube.com/${kind}/${name}`,

  bilibiliVideo: (bvid: string, part: number) =>
    `https://www.bilibili.com/video/${bvid}${part > 1 ? `?p=${part}` : ""}`,
  bilibiliEpisode: (id: string) =>
    `https://www.bilibili.com/bangumi/play/ep${id}`,
  bilibiliSeason: (id: string) =>
    `https://www.bilibili.com/bangumi/play/ss${id}`,
  bilibiliSpace: (uid: string) => `https://space.bilibili.com/${uid}`,
  bilibiliFavlist: (uid: string, fid: string) =>
    `https://space.bilibili.com/${uid}/favlist?fid=${fid}`,
  bilibiliCollection: (uid: string, sid: string) =>
    `https://space.bilibili.com/${uid}/lists?sid=${sid}`,

  xPost: (id: string) => `https://x.com/i/status/${id}`,
  xProfile: (handle: string) => `https://x.com/${handle}`,

  xiaohongshuNote: (id: string) => `https://www.xiaohongshu.com/explore/${id}`,
  xiaohongshuProfile: (uid: string) =>
    `https://www.xiaohongshu.com/user/profile/${uid}`,

  instagramPost: (code: string) => `https://www.instagram.com/p/${code}/`,
  instagramProfile: (handle: string) => `https://www.instagram.com/${handle}/`,

  spotifyItem: (kind: SpotifyKind, id: string) =>
    `https://open.spotify.com/${kind}/${id}`,

  redditPost: (id: string) => `https://www.reddit.com/comments/${id}/`,
  redditComment: (postId: string, commentId: string) =>
    `https://www.reddit.com/comments/${postId}/comment/${commentId}/`,
  redditSubreddit: (name: string) => `https://www.reddit.com/r/${name}/`,
  redditUser: (name: string) => `https://www.reddit.com/user/${name}/`,

  goodreadsBook: (id: string) => `https://www.goodreads.com/book/show/${id}`,
  goodreadsAuthor: (id: string) =>
    `https://www.goodreads.com/author/show/${id}`,
  goodreadsSeries: (id: string) => `https://www.goodreads.com/series/${id}`,

  wikipediaArticle: (language: string, encodedTitle: string) =>
    `https://${language}.wikipedia.org/wiki/${encodedTitle}`,

  linkedinProfile: (handle: string) => `https://www.linkedin.com/in/${handle}/`,
  linkedinCompany: (name: string) =>
    `https://www.linkedin.com/company/${name}/`,
  linkedinPost: (urn: LinkedInUrn) =>
    `https://www.linkedin.com/feed/update/urn:li:${urn.type}:${urn.id}/`,
  linkedinComment: (urn: LinkedInUrn, commentId: string) =>
    `https://www.linkedin.com/feed/update/urn:li:${urn.type}:${urn.id}/?dashCommentUrn=${encodeURIComponent(
      `urn:li:fsd_comment:(${commentId},urn:li:${urn.type}:${urn.id})`,
    )}`,
  linkedinArticle: (slug: string) => `https://www.linkedin.com/pulse/${slug}/`,
};

export const LINKEDIN_POST_TYPES = ["activity", "share", "ugcPost"] as const;
export type LinkedInUrn = {
  type: (typeof LINKEDIN_POST_TYPES)[number];
  id: string;
};

export const SPOTIFY_KINDS = [
  "track",
  "album",
  "playlist",
  "episode",
  "show",
  "artist",
  "audiobook",
  "user",
] as const;
export type SpotifyKind = (typeof SPOTIFY_KINDS)[number];

export const ID_PATTERNS = {
  youtubeVideo: /^[\w-]{11}$/,
  youtubeHandle: /^[\w.-]{3,30}$/,
  youtubeChannel: /^UC[\w-]{22}$/,
  bilibiliBv: /^BV[0-9A-Za-z]{10}$/,
  bilibiliAv: /^av(\d+)$/i,
  bilibiliEpisode: /^ep(\d+)$/,
  bilibiliSeason: /^ss(\d+)$/,
  numeric: /^\d+$/,
  xHandle: /^\w{1,15}$/,
  xiaohongshuId: /^[0-9a-f]{24}$/i,
  instagramPost: /^[\w-]+$/,
  instagramHandle: /^[\w.]{1,30}$/,
  spotifyId: /^[\w.-]+$/,
  /** Language prefixes in paths, such as `/en/` or `/zh-Hans/` on Bilibili. */
  localePath: /^[a-z]{2}(-[A-Za-z]{2,4})?$/,
  redditId: /^[0-9a-z]+$/i,
  redditName: /^[\w-]{2,21}$/,
  goodreadsId: /^(\d+)(?:[-.].*)?$/,
  wikipediaLanguage: /^[a-z][a-z0-9-]*$/,
  /** Wikipedia paths for language variants, such as `/zh-hans/` or `/zh-tw/`. */
  wikipediaVariantPath: /^zh(-[a-z]+)?$/,
  linkedinHandle: /^[\w%-]+$/,
  /** `/posts/<user>_<slug>-<type>-<id>-<suffix>`. */
  linkedinPostSlug: /-(activity|share|ugcPost)-(\d+)(?:-[^-]+)?$/,
  linkedinUrn: /^urn:li:(activity|share|ugcPost):(\d+)$/,
  /** `dashCommentUrn`: `urn:li:fsd_comment:(<commentId>,urn:li:activity:<id>)`. */
  linkedinDashCommentUrn: /^urn:li:fsd_comment:\((\d+),/,
  /** `commentUrn`: `urn:li:comment:(activity:<id>,<commentId>)`. */
  linkedinCommentUrn: /^urn:li:comment:\(\w+:\d+,(\d+)\)$/,
  /** Spotify's `/intl-ja/` style prefixes. */
  spotifyLocalePath: /^intl-[a-z]{2}(-[a-z]{2})?$/i,
};

/** First path segments on X and Instagram that are app pages, not profiles. */
export const RESERVED_PROFILE_PATHS: ReadonlySet<string> = new Set([
  "home",
  "explore",
  "search",
  "i",
  "settings",
  "notifications",
  "messages",
  "compose",
  "hashtag",
  "login",
  "signup",
  "logout",
  "tos",
  "privacy",
  "accounts",
  "direct",
  "stories",
  "reels",
  "about",
  "legal",
  "developer",
]);

/** Query parameters removed from every link, plus anything starting with `utm_`. */
export const TRACKING_PARAMS: ReadonlySet<string> = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "twclid",
  "igshid",
  "igsh",
  "mc_cid",
  "mc_eid",
  "_hsenc",
  "_hsmi",
  "mkt_tok",
  "ref",
  "ref_src",
  "ref_url",
  "si",
  "spm",
  "spm_id_from",
  "trackid",
  "share_source",
  "share_medium",
  "share_from",
  "share_plat",
  "share_session_id",
  "share_tag",
  "share_times",
  "share_id",
  "vd_source",
  "from_spmid",
  "from_source",
  "xsec_token",
  "xsec_source",
  "wprov",
  "rcm",
  "lipi",
  "trk",
]);

/** Bilibili's published constants for converting `av` numbers to `BV` ids. */
export const BILIBILI_ID = {
  xorCode: BigInt("23442827791579"),
  maskCode: BigInt("2251799813685247"),
  maxAid: BigInt(1) << BigInt(51),
  base: BigInt(58),
  alphabet: "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf",
};

export type NormalizedLink =
  | {
      ok: true;
      normalizedUrl: string;
      /** `null` for any site that isn't a common platform. */
      commonPlatform: CommonPlatform | null;
    }
  | { ok: false; reason: "unsupported_page"; commonPlatform: CommonPlatform };
