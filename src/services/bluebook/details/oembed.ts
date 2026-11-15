import "server-only";
import {
  DETAILS_MAX_TITLE_LENGTH,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { fetchJson } from "./fetch";
import {
  absoluteHttpUrl,
  cleanText,
  decodeEntities,
  positiveNumber,
  toIsoDate,
  truncateText,
} from "./page-meta";

/** The fields of an oEmbed response that bluebook uses. */
type OEmbed = {
  type?: string;
  title?: unknown;
  author_name?: unknown;
  thumbnail_url?: unknown;
  width?: unknown;
  height?: unknown;
  html?: unknown;
};

/** Reads an oEmbed endpoint. Returns `null` if it can't be fetched. */
export async function fetchOEmbed(
  endpoint: string,
): Promise<Partial<ItemDetails> | null> {
  const data = await fetchJson<OEmbed>(endpoint);
  if (!data || typeof data !== "object") return null;
  const isMedia = data.type === "video" || data.type === "photo";
  return {
    title: cleanText(data.title),
    creator: cleanText(data.author_name),
    thumbnailUrl: absoluteHttpUrl(cleanText(data.thumbnail_url), endpoint),
    width: isMedia ? positiveNumber(data.width) : null,
    height: isMedia ? positiveNumber(data.height) : null,
    ...(typeof data.html === "string" ? fromXEmbed(data.html) : {}),
  };
}

/** Adds `url=<link>` to an oEmbed endpoint. */
export function oembedRequestUrl(endpoint: string, link: string) {
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}url=${encodeURIComponent(link)}`;
}

/**
 * X's oEmbed has no title; the post's text and date are inside its embed
 * HTML: `<blockquote class="twitter-tweet"><p>text</p>&mdash; Name (@handle)
 * <a href="…">March 21, 2006</a></blockquote>`.
 */
function fromXEmbed(html: string): Partial<ItemDetails> {
  if (!/class="twitter-tweet"/.test(html)) return {};
  const paragraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  const text = paragraph
    ? decodeEntities(
        paragraph.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""),
      ).trim()
    : "";
  const links = [...html.matchAll(/<a\b[^>]*>([^<]*)<\/a>/gi)];
  const date = links.at(-1)?.[1];
  const firstLine = cleanText(text.split("\n")[0]);
  return {
    title: truncateText(firstLine, DETAILS_MAX_TITLE_LENGTH),
    description: cleanText(text),
    publishedAt: toIsoDate(cleanText(date ? decodeEntities(date) : null)),
  };
}
