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
  "wikipedia_api" | "oembed" | "page_meta" | "share_text";

export type DetailsResult = {
  details: ItemDetails;
  /** Which source filled each field. Fields left `null` have no entry. */
  sources: Partial<Record<DetailField, DetailsSource>>;
};

/**
 * Platforms whose oEmbed endpoint is called directly, instead of reading the
 * page and looking for one. `link` is which form of the link to send.
 */
export const KNOWN_OEMBED_ENDPOINTS: Partial<
  Record<CommonPlatform, { endpoint: string; link: "normalized" | "resolved" }>
> = {
  [CommonPlatform.YouTube]: {
    endpoint: "https://www.youtube.com/oembed?format=json",
    link: "normalized",
  },
  [CommonPlatform.Spotify]: {
    endpoint: "https://open.spotify.com/oembed",
    link: "normalized",
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
  };

/** Sent with every request, so sites can see who is asking. */
export const DETAILS_USER_AGENT =
  "bluebook/1.0 (+https://bluebook.kohrachel.com)";

export const DETAILS_TIMEOUT_MS = 5000;
export const DETAILS_MAX_REDIRECTS = 5;
/** Pages are read only this far; titles and meta tags are near the top. */
export const DETAILS_MAX_PAGE_BYTES = 512 * 1024;
export const DETAILS_MAX_JSON_BYTES = 1024 * 1024;
/** Titles made from a post's text (X) are cut to this many characters. */
export const DETAILS_MAX_TITLE_LENGTH = 120;
/** Longer descriptions are cut to this many characters. */
export const DETAILS_MAX_DESCRIPTION_LENGTH = 1000;
