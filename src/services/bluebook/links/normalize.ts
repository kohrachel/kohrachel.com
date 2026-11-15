import { assertExhaustive } from "@/lib/utils";
import {
  CANONICAL_URL,
  COMMON_PLATFORM_HOSTS,
  CommonPlatform,
  ID_PATTERNS,
  RESERVED_PROFILE_PATHS,
  SPOTIFY_KINDS,
  TRACKING_PARAMS,
  type LinkedInUrn,
  type NormalizedLink,
  type SpotifyKind,
} from "@/domain-types/bluebook/links";
import { avToBv } from "./bilibili-id";

/**
 * Reduces a link to one standard form, so every way of linking to the same
 * page gives the same `normalizedUrl`. Pure: no network. A common platform's
 * pages must match one of its formats in `CANONICAL_URL`; any other site gets
 * general cleanup.
 */
export function normalizeUrl(input: string): NormalizedLink {
  const url = new URL(input);
  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  url.hash = "";
  url.username = "";
  url.password = "";

  const host = url.hostname.replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);
  const commonPlatform = commonPlatformForHost(host);

  if (!commonPlatform) {
    return { ok: true, normalizedUrl: generic(url), commonPlatform: null };
  }
  const normalizedUrl = normalizeFor(commonPlatform, url, host, segments);
  return normalizedUrl
    ? { ok: true, normalizedUrl, commonPlatform }
    : { ok: false, reason: "unsupported_page", commonPlatform };
}

export function commonPlatformForHost(host: string): CommonPlatform | null {
  const bare = host.toLowerCase().replace(/^www\./, "");
  for (const platform of Object.values(CommonPlatform)) {
    const matches = COMMON_PLATFORM_HOSTS[platform].some((pattern) =>
      pattern.startsWith("*.")
        ? bare.endsWith(pattern.slice(1))
        : bare === pattern,
    );
    if (matches) return platform;
  }
  return null;
}

function normalizeFor(
  platform: CommonPlatform,
  url: URL,
  host: string,
  segments: string[],
): string | null {
  switch (platform) {
    case CommonPlatform.YouTube:
      return youtube(url, host, segments);
    case CommonPlatform.Bilibili:
      return bilibili(url, host, segments);
    case CommonPlatform.X:
      return x(segments);
    case CommonPlatform.Xiaohongshu:
      return xiaohongshu(segments);
    case CommonPlatform.Instagram:
      return instagram(segments);
    case CommonPlatform.Spotify:
      return spotify(segments);
    case CommonPlatform.Reddit:
      return reddit(host, segments);
    case CommonPlatform.Goodreads:
      return goodreads(segments);
    case CommonPlatform.Wikipedia:
      return wikipedia(url, host, segments);
    case CommonPlatform.LinkedIn:
      return linkedin(url, segments);
    default:
      return assertExhaustive(platform);
  }
}

function youtube(url: URL, host: string, segments: string[]) {
  const [first, second] = segments;
  const videoId =
    host === "youtu.be"
      ? first
      : first === "watch"
        ? url.searchParams.get("v")
        : ["shorts", "embed", "live", "v", "e"].includes(first)
          ? second
          : null;
  if (videoId && ID_PATTERNS.youtubeVideo.test(videoId)) {
    return CANONICAL_URL.youtubeVideo(videoId);
  }
  if (host === "youtu.be") return null;

  const list = url.searchParams.get("list");
  if (first === "playlist" && list) {
    return CANONICAL_URL.youtubePlaylist(list);
  }

  const handle = first?.startsWith("@") ? first.slice(1) : null;
  if (handle && ID_PATTERNS.youtubeHandle.test(handle)) {
    return CANONICAL_URL.youtubeHandle(handle.toLowerCase());
  }
  if (
    first === "channel" &&
    second &&
    ID_PATTERNS.youtubeChannel.test(second)
  ) {
    return CANONICAL_URL.youtubeChannel(second);
  }
  if ((first === "c" || first === "user") && second) {
    return CANONICAL_URL.youtubeLegacyChannel(first, second);
  }
  return null;
}

function bilibili(url: URL, host: string, segments: string[]) {
  const path = ID_PATTERNS.localePath.test(segments[0] ?? "")
    ? segments.slice(1)
    : segments;

  if (host === "space.bilibili.com") {
    return bilibiliSpace(url, path);
  }
  if (host === "m.bilibili.com" && path[0] === "space") {
    return bilibiliSpace(url, path.slice(1));
  }

  const videoIndex = path.indexOf("video");
  const id = videoIndex >= 0 ? path[videoIndex + 1] : undefined;
  const av = id?.match(ID_PATTERNS.bilibiliAv);
  const bvid =
    id && ID_PATTERNS.bilibiliBv.test(id)
      ? id
      : av
        ? avToBv(BigInt(av[1]))
        : null;
  if (bvid) {
    const part = Number(url.searchParams.get("p"));
    return CANONICAL_URL.bilibiliVideo(bvid, Number.isInteger(part) ? part : 1);
  }

  if (path[0] === "bangumi" && path[1] === "play" && path[2]) {
    const episode = path[2].match(ID_PATTERNS.bilibiliEpisode);
    if (episode) return CANONICAL_URL.bilibiliEpisode(episode[1]);
    const season = path[2].match(ID_PATTERNS.bilibiliSeason);
    if (season) return CANONICAL_URL.bilibiliSeason(season[1]);
  }
  return null;
}

function bilibiliSpace(url: URL, path: string[]) {
  const [uid, tab, tabId] = path;
  if (!uid || !ID_PATTERNS.numeric.test(uid)) return null;

  const fid = url.searchParams.get("fid");
  if (tab === "favlist" && fid && ID_PATTERNS.numeric.test(fid)) {
    return CANONICAL_URL.bilibiliFavlist(uid, fid);
  }
  const sid = tab === "lists" ? (url.searchParams.get("sid") ?? tabId) : null;
  if (sid && ID_PATTERNS.numeric.test(sid)) {
    return CANONICAL_URL.bilibiliCollection(uid, sid);
  }
  return CANONICAL_URL.bilibiliSpace(uid);
}

function x(segments: string[]) {
  const statusIndex = segments.findIndex(
    (s) => s === "status" || s === "statuses",
  );
  const id = statusIndex >= 0 ? segments[statusIndex + 1] : undefined;
  if (id && ID_PATTERNS.numeric.test(id)) {
    return CANONICAL_URL.xPost(id);
  }
  const handle = segments[0];
  if (
    handle &&
    ID_PATTERNS.xHandle.test(handle) &&
    !RESERVED_PROFILE_PATHS.has(handle.toLowerCase())
  ) {
    return CANONICAL_URL.xProfile(handle.toLowerCase());
  }
  return null;
}

function xiaohongshu(segments: string[]) {
  const [first, second, third, fourth] = segments;
  const noteId =
    first === "explore"
      ? second
      : first === "discovery" && second === "item"
        ? third
        : first === "user" && second === "profile"
          ? fourth
          : undefined;
  if (noteId && ID_PATTERNS.xiaohongshuId.test(noteId)) {
    return CANONICAL_URL.xiaohongshuNote(noteId.toLowerCase());
  }
  if (
    first === "user" &&
    second === "profile" &&
    third &&
    !fourth &&
    ID_PATTERNS.xiaohongshuId.test(third)
  ) {
    return CANONICAL_URL.xiaohongshuProfile(third.toLowerCase());
  }
  return null;
}

function instagram(segments: string[]) {
  const postIndex = segments.findIndex((s) =>
    ["p", "reel", "reels", "tv"].includes(s),
  );
  const code = postIndex >= 0 ? segments[postIndex + 1] : undefined;
  if (code && ID_PATTERNS.instagramPost.test(code)) {
    return CANONICAL_URL.instagramPost(code);
  }
  const handle = segments[0];
  if (
    handle &&
    ID_PATTERNS.instagramHandle.test(handle) &&
    !RESERVED_PROFILE_PATHS.has(handle.toLowerCase())
  ) {
    return CANONICAL_URL.instagramProfile(handle.toLowerCase());
  }
  return null;
}

function spotify(segments: string[]) {
  const withoutLocale = ID_PATTERNS.spotifyLocalePath.test(segments[0] ?? "")
    ? segments.slice(1)
    : segments;
  const [kind, id] =
    withoutLocale[0] === "embed" ? withoutLocale.slice(1) : withoutLocale;
  if (
    SPOTIFY_KINDS.includes(kind as SpotifyKind) &&
    id &&
    ID_PATTERNS.spotifyId.test(id)
  ) {
    return CANONICAL_URL.spotifyItem(kind as SpotifyKind, id);
  }
  return null;
}

function reddit(host: string, segments: string[]) {
  if (host === "redd.it") {
    const [id] = segments;
    return id && ID_PATTERNS.redditId.test(id)
      ? CANONICAL_URL.redditPost(id.toLowerCase())
      : null;
  }
  const path = segments[0] === "r" ? segments.slice(2) : segments;
  // `/r/<sub>/s/<code>` is a share link; it must be followed first.
  if (path[0] === "s") return null;
  const commentsIndex = path.indexOf("comments");
  if (commentsIndex >= 0) {
    const postId = path[commentsIndex + 1];
    if (!postId || !ID_PATTERNS.redditId.test(postId)) return null;
    // `/comments/<post>/comment/<id>` or `/comments/<post>/<slug>/<id>`.
    const rest = path.slice(commentsIndex + 2);
    const commentId = rest[1];
    return commentId && ID_PATTERNS.redditId.test(commentId)
      ? CANONICAL_URL.redditComment(
          postId.toLowerCase(),
          commentId.toLowerCase(),
        )
      : CANONICAL_URL.redditPost(postId.toLowerCase());
  }
  const [kind, name] = segments;
  if (!name || !ID_PATTERNS.redditName.test(name)) return null;
  if (kind === "r") return CANONICAL_URL.redditSubreddit(name.toLowerCase());
  if (kind === "user" || kind === "u") {
    return CANONICAL_URL.redditUser(name.toLowerCase());
  }
  return null;
}

function goodreads(segments: string[]) {
  const [first, second, third] = segments;
  const id = (value?: string) =>
    value?.match(ID_PATTERNS.goodreadsId)?.[1] ?? null;
  if (first === "book" && second === "show" && id(third)) {
    return CANONICAL_URL.goodreadsBook(id(third)!);
  }
  if (first === "author" && second === "show" && id(third)) {
    return CANONICAL_URL.goodreadsAuthor(id(third)!);
  }
  if (first === "series" && id(second)) {
    return CANONICAL_URL.goodreadsSeries(id(second)!);
  }
  return null;
}

function wikipedia(url: URL, host: string, segments: string[]) {
  const language = host.split(".")[0];
  if (!ID_PATTERNS.wikipediaLanguage.test(language) || language === "w") {
    return null;
  }
  const [first, ...rest] = segments;
  const rawTitle =
    first === "wiki" || ID_PATTERNS.wikipediaVariantPath.test(first ?? "")
      ? rest.join("/")
      : first === "w" && rest[0] === "index.php"
        ? url.searchParams.get("title")
        : null;
  if (!rawTitle) return null;

  const title = decodeOrNull(rawTitle)?.replaceAll(" ", "_");
  if (title === undefined) return null;
  const capitalized = title.charAt(0).toUpperCase() + title.slice(1);
  const encoded = encodeURIComponent(capitalized).replace(
    /%(28|29|2C|3A|2F|27|21)/g,
    (match) => decodeURIComponent(match),
  );
  return CANONICAL_URL.wikipediaArticle(language, encoded);
}

function decodeOrNull(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

function linkedin(url: URL, segments: string[]) {
  const [first, second] = segments;
  if (first === "in" && second && ID_PATTERNS.linkedinHandle.test(second)) {
    return CANONICAL_URL.linkedinProfile(second.toLowerCase());
  }
  if (
    first === "company" &&
    second &&
    ID_PATTERNS.linkedinHandle.test(second)
  ) {
    return CANONICAL_URL.linkedinCompany(second.toLowerCase());
  }
  if (first === "pulse" && second) {
    return CANONICAL_URL.linkedinArticle(second);
  }

  const urnMatch =
    first === "feed" && second === "update"
      ? decodeURIComponent(segments[2] ?? "").match(ID_PATTERNS.linkedinUrn)
      : first === "posts" && second
        ? second.match(ID_PATTERNS.linkedinPostSlug)
        : null;
  if (!urnMatch) return null;
  const urn = { type: urnMatch[1], id: urnMatch[2] } as LinkedInUrn;

  const dashComment = url.searchParams.get("dashCommentUrn");
  const comment = url.searchParams.get("commentUrn");
  const commentId = (dashComment?.match(ID_PATTERNS.linkedinDashCommentUrn) ??
    comment?.match(ID_PATTERNS.linkedinCommentUrn))?.[1];
  return commentId
    ? CANONICAL_URL.linkedinComment(urn, commentId)
    : CANONICAL_URL.linkedinPost(urn);
}

/** Lowercase host without `www.`, no tracking params, sorted query, no trailing slash. */
function generic(url: URL) {
  const out = new URL(url.toString());
  out.hostname = url.hostname.replace(/^www\./, "");

  for (const key of [...out.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) {
      out.searchParams.delete(key);
    }
  }
  out.searchParams.sort();

  if (out.pathname.length > 1) {
    out.pathname = out.pathname.replace(/\/+$/, "");
  }
  return out.toString();
}
