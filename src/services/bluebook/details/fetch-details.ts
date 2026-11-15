import "server-only";
import { assertExhaustive } from "@/lib/utils";
import {
  EMPTY_DETAILS,
  KNOWN_OEMBED_ENDPOINTS,
  type DetailsResult,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { fillMissing } from "./merge";
import { fetchOEmbed, oembedRequestUrl } from "./oembed";
import { titleFromLink } from "./link-title";
import { fetchPageDetails } from "./page";
import { titleFromShareText } from "./share-text";
import { fetchWikipediaDetails } from "./wikipedia";

export type DetailsInput = {
  /** The link as pasted, found in `pastedText`. */
  url: string;
  /** The real page address, after unwrapping and following short links. */
  resolvedUrl: string;
  normalizedUrl: string;
  commonPlatform: CommonPlatform | null;
  /** Everything that was pasted, including any share text around the link. */
  pastedText: string;
};

/**
 * Fetches details to pre-fill the confirm form, from the best source first:
 * the platform's own API, its oEmbed endpoint, the page itself, the share
 * text, then (for profiles) a title built from the link. Never throws: whatever can't be found stays `null` for the form
 * to fill in.
 */
export async function fetchDetails(
  input: DetailsInput,
): Promise<DetailsResult> {
  const { commonPlatform, resolvedUrl, normalizedUrl } = input;
  let result: DetailsResult = { details: { ...EMPTY_DETAILS }, sources: {} };

  if (!commonPlatform) {
    result = await fetchPageDetails(resolvedUrl, null);
  } else {
    const known = KNOWN_OEMBED_ENDPOINTS[commonPlatform];
    const [api, oembed, page] = await Promise.all([
      fetchFromPlatformApi(commonPlatform, normalizedUrl),
      known
        ? fetchOEmbed(
            oembedRequestUrl(
              known.endpoint,
              known.link === "resolved" ? resolvedUrl : normalizedUrl,
            ),
          )
        : null,
      fetchPageDetails(
        // Xiaohongshu pages only open with the token in the link as shared.
        commonPlatform === CommonPlatform.Xiaohongshu
          ? resolvedUrl
          : normalizedUrl,
        commonPlatform,
      ),
    ]);
    if (api) result = fillMissing(result, api.details, api.source);
    result = fillMissing(result, oembed, "oembed");
    for (const field of Object.keys(page.sources) as (keyof ItemDetails)[]) {
      result = fillMissing(
        result,
        { [field]: page.details[field] },
        page.sources[field]!,
      );
    }
  }

  result = fillMissing(
    result,
    { title: titleFromShareText(input.pastedText, input.url) },
    "share_text",
  );
  return commonPlatform
    ? fillMissing(
        result,
        { title: titleFromLink(commonPlatform, normalizedUrl) },
        "link",
      )
    : result;
}

/** The platform's own API, for platforms that have one bluebook uses. */
async function fetchFromPlatformApi(
  platform: CommonPlatform,
  normalizedUrl: string,
) {
  switch (platform) {
    case CommonPlatform.Wikipedia: {
      const details = await fetchWikipediaDetails(normalizedUrl);
      return details && { details, source: "wikipedia_api" as const };
    }
    case CommonPlatform.YouTube:
    case CommonPlatform.Bilibili:
    case CommonPlatform.X:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Instagram:
    case CommonPlatform.Spotify:
    case CommonPlatform.Reddit:
    case CommonPlatform.Goodreads:
    case CommonPlatform.LinkedIn:
      return null;
    default:
      return assertExhaustive(platform);
  }
}
