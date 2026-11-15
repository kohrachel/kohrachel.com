import { CommonPlatform } from "./links";

/** Details about a piece of content, used to pre-fill the confirm form. */
export type ItemDetails = {
  title: string | null;
  creator: string | null;
  /** ISO 8601. */
  publishedAt: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  /** Pixel size of the video or image, when known. Taller than wide = vertical. */
  width: number | null;
  height: number | null;
};

export type DetailField = keyof ItemDetails;

export const DETAIL_FIELDS: readonly DetailField[] = [
  "title",
  "creator",
  "publishedAt",
  "description",
  "thumbnailUrl",
  "durationSeconds",
  "width",
  "height",
];

export const EMPTY_DETAILS: ItemDetails = {
  title: null,
  creator: null,
  publishedAt: null,
  description: null,
  thumbnailUrl: null,
  durationSeconds: null,
  width: null,
  height: null,
};

/** Where a detail came from, in the order they're tried. */
export type DetailsSource =
  | "youtube_api"
  | "bilibili_api"
  | "wikipedia_api"
  | "linkedin_embed"
  | "oembed"
  | "page_meta"
  | "share_text"
  /** Built from the link itself, such as `r/sysadmin` or `@jack`. */
  | "link";

export type DetailsResult = {
  details: ItemDetails;
  /** Which source filled each field. Fields left `null` have no entry. */
  sources: Partial<Record<DetailField, DetailsSource>>;
};

/**
 * Platforms whose oEmbed endpoint is called directly, instead of reading the
 * page and looking for one. `link` is which form of the link to send.
 *
 * Spotify isn't listed: for a show, its oEmbed returns the latest episode's
 * title instead of the show's. Its page has everything instead.
 */
export const KNOWN_OEMBED_ENDPOINTS: Partial<
  Record<
    CommonPlatform,
    {
      endpoint: string;
      link: "normalized" | "resolved" | ((normalizedUrl: string) => string);
    }
  >
> = {
  // Asked with a video's `/shorts/` link, YouTube reports its real shape:
  // 113×200 for a Short, 200×113 for any other video. Asked with the
  // `/watch?v=` link, every video comes back 200×113.
  [CommonPlatform.YouTube]: {
    endpoint: "https://www.youtube.com/oembed?format=json",
    link: (normalizedUrl) =>
      normalizedUrl.replace(
        /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/,
        "https://www.youtube.com/shorts/$1",
      ),
  },
  // Reddit's endpoint needs the full link, including the subreddit.
  [CommonPlatform.Reddit]: {
    endpoint: "https://www.reddit.com/oembed",
    link: "resolved",
  },
  [CommonPlatform.X]: {
    endpoint: "https://publish.x.com/oembed?omit_script=1",
    link: "normalized",
  },
};

/**
 * A page with a title like this is a bot check, not the content, so its
 * details are thrown away. Applies to every site.
 */
export const BOT_CHECK_PAGE_TITLE =
  /prove your humanity|^just a moment|^attention required|^access denied|are you a robot|verify (?:that )?you are (?:a )?human|^security check/i;

/**
 * A request that ends on one of these paths reached a login wall or an error
 * page, not the content, so its details are thrown away.
 */
export const BLOCKED_PAGE_PATH =
  /^\/(?:login|signin|sign-in|authwall|accounts\/login|uas\/login|404)(?:[/?]|$)/i;

/**
 * On a common platform, a page with a title like this is a login or sign-up
 * page shown instead of the content, so its details are thrown away.
 */
export const LOGIN_PAGE_TITLE =
  /^(?:log ?in|sign ?in|sign ?up|join)\b|\b(?:log ?in|sign ?in|sign ?up)\s*[|·-]|登录|注册/i;

/** Site names that platforms add to the end of page titles. */
export const PLATFORM_TITLE_SUFFIXES: Partial<Record<CommonPlatform, RegExp>> =
  {
    [CommonPlatform.YouTube]: /\s+-\s+YouTube$/,
    [CommonPlatform.Bilibili]: /[_-]哔哩哔哩(?:_bilibili)?$/i,
    [CommonPlatform.Wikipedia]: /\s+-\s+(?:Wikipedia|维基百科|維基百科)[^-]*$/,
    [CommonPlatform.LinkedIn]: /\s+\|\s+LinkedIn$/,
    [CommonPlatform.Goodreads]: /\s+(?:by\s+.+\s+)?\|\s+Goodreads$/,
    [CommonPlatform.Spotify]: /\s+\|\s+Spotify$/,
    [CommonPlatform.Reddit]: /\s+:\s+r\/\w+$/,
    [CommonPlatform.X]: /\s+(?:on|\/)\s+X$/,
    [CommonPlatform.Instagram]: /\s+•\s+Instagram(?:\s+photos and videos)?$/,
  };

export const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

/** Bilibili's public web APIs. No key; they answer `{ code: 0, data }`. */
export const BILIBILI_API = {
  video: (bvid: string) =>
    `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
  favorites: (fid: string) =>
    `https://api.bilibili.com/x/v3/fav/folder/info?media_id=${fid}`,
  season: (key: "ep_id" | "season_id", id: string) =>
    `https://api.bilibili.com/pgc/view/web/season?${key}=${id}`,
};

/** LinkedIn's public "embed this post" page, which works for some posts. */
export const LINKEDIN_EMBED_URL = (urn: string) =>
  `https://www.linkedin.com/embed/feed/update/${urn}`;

/**
 * LinkedIn post and comment ids, and X post ids since late 2010, start with
 * a timestamp: the id shifted right 22 bits is milliseconds since the epoch
 * below. That gives a post's date from its link alone.
 */
export const ID_TIMESTAMP_EPOCH_MS = { linkedin: 0, x: 1288834974657 };
/** X ids from before the timestamp format are smaller than this. */
export const X_FIRST_TIMESTAMP_ID = BigInt("29700859247");

/** Sent with every request, so sites can see who is asking. */
export const DETAILS_USER_AGENT =
  "bluebook/1.0 (+https://bluebook.kohrachel.com)";

export const DETAILS_TIMEOUT_MS = 5000;
export const DETAILS_MAX_REDIRECTS = 5;
/** Pages are read only this far; titles and meta tags are near the top. */
export const DETAILS_MAX_PAGE_BYTES = 512 * 1024;
export const DETAILS_MAX_JSON_BYTES = 1024 * 1024;
/**
 * A Bilibili anime season's response lists every episode (1.7 MB for a
 * 317-episode series), so it's allowed more.
 */
export const BILIBILI_SEASON_MAX_BYTES = 8 * 1024 * 1024;
/** Titles made from a post's text (X) are cut to this many characters. */
export const DETAILS_MAX_TITLE_LENGTH = 120;
/** Longer descriptions are cut to this many characters. */
export const DETAILS_MAX_DESCRIPTION_LENGTH = 1000;
