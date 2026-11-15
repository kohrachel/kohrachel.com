import "server-only";
import {
  BILIBILI_API,
  BILIBILI_SEASON_MAX_BYTES,
  DETAILS_MAX_DESCRIPTION_LENGTH,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { fetchJson } from "./fetch";
import { cleanText, positiveNumber, truncateText } from "./page-meta";

type Dimension = { width?: number; height?: number; rotate?: number };
type Response<T> = { code?: number; data?: T; result?: T };
type Video = {
  title?: string;
  owner?: { name?: string };
  pubdate?: number;
  desc?: string;
  pic?: string;
  duration?: number;
  dimension?: Dimension;
  pages?: {
    page?: number;
    part?: string;
    duration?: number;
    dimension?: Dimension;
  }[];
};
type Favorites = {
  title?: string;
  upper?: { name?: string };
  intro?: string;
  cover?: string;
};
type Season = {
  title?: string;
  evaluate?: string;
  cover?: string;
  publish?: { pub_time?: string };
  episodes?: {
    id?: number;
    show_title?: string;
    pub_time?: number;
    duration?: number;
    cover?: string;
    dimension?: Dimension;
  }[];
};

/**
 * Details from Bilibili's public APIs for a cleaned Bilibili link: a video
 * (or one part of it), an anime episode or season, or a favorites folder.
 * Spaces and collections return `null`: their APIs refuse requests without
 * a browser's signature, so the page is used instead.
 */
export async function fetchBilibiliDetails(
  normalizedUrl: string,
): Promise<Partial<ItemDetails> | null> {
  const url = new URL(normalizedUrl);
  const segments = url.pathname.split("/").filter(Boolean);

  if (url.hostname === "www.bilibili.com" && segments[0] === "video") {
    return video(segments[1], Number(url.searchParams.get("p") ?? 1));
  }
  const play = segments[0] === "bangumi" && segments[1] === "play";
  const episode = play ? segments[2]?.match(/^ep(\d+)$/)?.[1] : undefined;
  if (episode) return season("ep_id", episode, Number(episode));
  const seasonId = play ? segments[2]?.match(/^ss(\d+)$/)?.[1] : undefined;
  if (seasonId) return season("season_id", seasonId, null);

  const fid = url.searchParams.get("fid");
  if (
    url.hostname === "space.bilibili.com" &&
    segments[1] === "favlist" &&
    fid
  ) {
    return favorites(fid);
  }
  return null;
}

async function video(bvid: string, part: number) {
  const response = await fetchJson<Response<Video>>(BILIBILI_API.video(bvid));
  const data = response?.code === 0 ? response.data : null;
  if (!data) return null;
  const page = part > 1 ? data.pages?.find((p) => p.page === part) : null;
  const title = cleanText(data.title);
  return {
    title: page?.part && title ? `${title} - ${cleanText(page.part)}` : title,
    creator: cleanText(data.owner?.name),
    publishedAt: fromUnixSeconds(data.pubdate),
    description: description(data.desc),
    thumbnailUrl: https(data.pic),
    durationSeconds: positiveNumber(page?.duration ?? data.duration),
    ...size(page?.dimension ?? data.dimension),
  };
}

async function season(
  key: "ep_id" | "season_id",
  id: string,
  episodeId: number | null,
) {
  const response = await fetchJson<Response<Season>>(
    BILIBILI_API.season(key, id),
    { maxBytes: BILIBILI_SEASON_MAX_BYTES },
  );
  const data = response?.code === 0 ? response.result : null;
  if (!data) return null;
  const seasonTitle = cleanText(data.title);
  if (episodeId === null) {
    return {
      title: seasonTitle,
      // "2020-07-25 20:00:00", in China's time zone.
      publishedAt: data.publish?.pub_time
        ? fromChinaTime(data.publish.pub_time)
        : null,
      description: description(data.evaluate),
      thumbnailUrl: https(data.cover),
    };
  }
  const episode = data.episodes?.find((e) => e.id === episodeId);
  if (!episode) return null;
  const episodeTitle = cleanText(episode.show_title);
  return {
    title: [seasonTitle, episodeTitle].filter(Boolean).join(" ") || null,
    publishedAt: fromUnixSeconds(episode.pub_time),
    description: description(data.evaluate),
    thumbnailUrl: https(episode.cover ?? data.cover),
    // Episode durations are in milliseconds.
    durationSeconds: episode.duration
      ? Math.round(episode.duration / 1000)
      : null,
    ...size(episode.dimension),
  };
}

async function favorites(fid: string) {
  const response = await fetchJson<Response<Favorites>>(
    BILIBILI_API.favorites(fid),
  );
  const data = response?.code === 0 ? response.data : null;
  if (!data) return null;
  return {
    title: cleanText(data.title),
    creator: cleanText(data.upper?.name),
    description: description(data.intro),
    thumbnailUrl: https(data.cover),
  };
}

/** Bilibili uses "-" for an empty description. */
function description(text: string | undefined) {
  const clean = cleanText(text);
  return clean === "-"
    ? null
    : truncateText(clean, DETAILS_MAX_DESCRIPTION_LENGTH);
}

/** Width and height, swapped when the video is stored rotated. */
function size(dimension: Dimension | undefined) {
  const width = positiveNumber(dimension?.width);
  const height = positiveNumber(dimension?.height);
  return dimension?.rotate === 1
    ? { width: height, height: width }
    : { width, height };
}

function fromUnixSeconds(seconds: number | undefined) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function fromChinaTime(text: string) {
  const date = new Date(`${text.replace(" ", "T")}+08:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Bilibili image links often start with http; the same paths work on https. */
function https(url: string | undefined) {
  const clean = cleanText(url);
  if (!clean) return null;
  return clean.replace(/^(?:https?:)?\/\//, "https://");
}
