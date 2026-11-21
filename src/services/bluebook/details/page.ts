import "server-only";
import {
  BLOCKED_PAGE_PATH,
  BOT_CHECK_PAGE_TITLE,
  EMPTY_DETAILS,
  PLATFORM_MAX_PAGE_BYTES,
  type DetailsResult,
} from "@/domain-types/bluebook/details";
import { fetchText } from "./fetch";
import { fillMissing } from "./merge";
import { fetchOEmbed } from "./oembed";
import { parsePageMeta } from "./page-meta";
import { cleanPageDetails } from "./platform-cleanup";
import type { CommonPlatform } from "@/domain-types/bluebook/links";

/**
 * Details from the page itself: its oEmbed endpoint if it advertises one
 * (other sites only), then its meta tags. Returns empty details when the page can't be read, or
 * when it turned out to be a login wall, bot check or error page. A common platform's
 * page details are tidied by `cleanPageDetails`, and some platforms' pages
 * are read further than others (`PLATFORM_MAX_PAGE_BYTES`).
 */
export async function fetchPageDetails(
  url: string,
  platform: CommonPlatform | null,
): Promise<DetailsResult> {
  const empty: DetailsResult = { details: { ...EMPTY_DETAILS }, sources: {} };
  const page = await fetchText(url, {
    maxBytes: platform ? PLATFORM_MAX_PAGE_BYTES[platform] : undefined,
  });
  if (!page || !/html/i.test(page.contentType)) return empty;
  if (BLOCKED_PAGE_PATH.test(new URL(page.url).pathname)) return empty;

  const parsed = parsePageMeta(page.body, page.url);
  if (parsed.details.title && BOT_CHECK_PAGE_TITLE.test(parsed.details.title)) {
    return empty;
  }
  const details = platform
    ? cleanPageDetails(platform, parsed.details, url, page.body)
    : parsed.details;
  if (!details) return empty;

  // Common platforms' oEmbed endpoints are chosen in KNOWN_OEMBED_ENDPOINTS
  // (Spotify's is left out on purpose), so only other sites' are followed.
  const fromOEmbed =
    parsed.oembedUrl && !platform
      ? fillMissing(empty, await fetchOEmbed(parsed.oembedUrl), "oembed")
      : empty;
  return fillMissing(fromOEmbed, details, "page_meta");
}
