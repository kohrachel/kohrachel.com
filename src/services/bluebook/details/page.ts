import "server-only";
import {
  BLOCKED_PAGE_PATH,
  EMPTY_DETAILS,
  type DetailsResult,
} from "@/domain-types/bluebook/details";
import { fetchText } from "./fetch";
import { fillMissing } from "./merge";
import { fetchOEmbed } from "./oembed";
import { parsePageMeta } from "./page-meta";
import { cleanPageDetails } from "./platform-cleanup";
import type { CommonPlatform } from "@/domain-types/bluebook/links";

/**
 * Details from the page itself: its oEmbed endpoint if it advertises one,
 * then its meta tags. Returns empty details when the page can't be read, or
 * when it turned out to be a login wall or error page. A common platform's
 * page details are tidied by `cleanPageDetails`.
 */
export async function fetchPageDetails(
  url: string,
  platform: CommonPlatform | null,
): Promise<DetailsResult> {
  const empty: DetailsResult = { details: { ...EMPTY_DETAILS }, sources: {} };
  const page = await fetchText(url);
  if (!page || !/html/i.test(page.contentType)) return empty;
  if (BLOCKED_PAGE_PATH.test(new URL(page.url).pathname)) return empty;

  const parsed = parsePageMeta(page.body, page.url);
  const details = platform
    ? cleanPageDetails(platform, parsed.details)
    : parsed.details;
  if (!details) return empty;

  let result = empty;
  if (parsed.oembedUrl) {
    result = fillMissing(result, await fetchOEmbed(parsed.oembedUrl), "oembed");
  }
  return fillMissing(result, details, "page_meta");
}
