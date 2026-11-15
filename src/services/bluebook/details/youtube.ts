import "server-only";
import {
  DETAILS_MAX_DESCRIPTION_LENGTH,
  YOUTUBE_API_URL,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { fetchJson } from "./fetch";
import {
  cleanText,
  isoDurationToSeconds,
  toIsoDate,
  truncateText,
} from "./page-meta";

type Thumbnail = { url?: string };
type Snippet = {
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  description?: string;
  thumbnails?: Record<string, Thumbnail>;
};
type ListResponse = {
  items?: { snippet?: Snippet; contentDetails?: { duration?: string } }[];
};

/**
 * Details from the YouTube Data API for a cleaned YouTube link: a video,
 * playlist or channel. Returns `null` without `YOUTUBE_API_KEY`, or when
 * YouTube has nothing for the link.
 */
export async function fetchYouTubeDetails(
  normalizedUrl: string,
): Promise<Partial<ItemDetails> | null> {
  const key = process.env.YOUTUBE_API_KEY;
  const request = key ? youtubeRequest(new URL(normalizedUrl)) : null;
  if (!key || !request) return null;

  const params = new URLSearchParams({ ...request.params, key });
  const data = await fetchJson<ListResponse>(
    `${YOUTUBE_API_URL}/${request.resource}?${params}`,
  );
  const item = data?.items?.[0];
  const snippet = item?.snippet;
  if (!snippet) return null;

  const isChannel = request.resource === "channels";
  return {
    title: cleanText(snippet.title),
    creator: isChannel
      ? cleanText(snippet.title)
      : cleanText(snippet.channelTitle),
    // A channel's publishedAt is when it was created, not a publish date.
    publishedAt: isChannel ? null : toIsoDate(snippet.publishedAt ?? null),
    description: truncateText(
      cleanText(snippet.description),
      DETAILS_MAX_DESCRIPTION_LENGTH,
    ),
    thumbnailUrl: bestThumbnail(snippet.thumbnails),
    durationSeconds: isoDurationToSeconds(
      item.contentDetails?.duration ?? null,
    ),
  };
}

function youtubeRequest(
  url: URL,
): { resource: string; params: Record<string, string> } | null {
  const [first, second] = url.pathname.split("/").filter(Boolean);
  const video = url.searchParams.get("v");
  const list = url.searchParams.get("list");
  if (first === "watch" && video) {
    return {
      resource: "videos",
      params: { part: "snippet,contentDetails", id: video },
    };
  }
  if (first === "playlist" && list) {
    return { resource: "playlists", params: { part: "snippet", id: list } };
  }
  if (first?.startsWith("@")) {
    return {
      resource: "channels",
      params: { part: "snippet", forHandle: first },
    };
  }
  if (first === "channel" && second) {
    return { resource: "channels", params: { part: "snippet", id: second } };
  }
  if (first === "user" && second) {
    return {
      resource: "channels",
      params: { part: "snippet", forUsername: second },
    };
  }
  // `/c/<name>` links have no API lookup; the page is used instead.
  return null;
}

function bestThumbnail(thumbnails: Snippet["thumbnails"]) {
  for (const size of ["maxres", "standard", "high", "medium", "default"]) {
    const url = thumbnails?.[size]?.url;
    if (url) return url;
  }
  return null;
}
