import "server-only";
import {
  EMPTY_DETAILS,
  LINKEDIN_EMBED_URL,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { fetchText } from "./fetch";
import { cleanText, parsePageMeta } from "./page-meta";

/**
 * Details from LinkedIn's public embed page for a post. It works only for
 * posts whose author allows embedding, and only for the post itself, so
 * comment links and other pages return `null`.
 */
export async function fetchLinkedInDetails(
  normalizedUrl: string,
): Promise<Partial<ItemDetails> | null> {
  const url = new URL(normalizedUrl);
  const urn = url.pathname.match(/^\/feed\/update\/(urn:li:\w+:\d+)\/?$/)?.[1];
  if (!urn || url.searchParams.has("dashCommentUrn")) return null;

  const page = await fetchText(LINKEDIN_EMBED_URL(urn));
  if (!page) return null;
  const { details } = parsePageMeta(page.body, page.url);
  return splitAuthor(details);
}

/** The embed page's title is "<start of the post>… | <author>". */
export function splitAuthor(details: ItemDetails): Partial<ItemDetails> | null {
  const match = details.title?.match(/^([\s\S]+?)\s+\|\s+([^|]+)$/);
  if (!match || cleanText(match[2]) === "LinkedIn") return null;
  return {
    ...EMPTY_DETAILS,
    title: cleanText(match[1]),
    creator: cleanText(match[2]),
    description: details.description,
    thumbnailUrl: details.thumbnailUrl,
  };
}
