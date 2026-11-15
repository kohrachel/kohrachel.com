import "server-only";
import { assertExhaustive } from "@/lib/utils";
import {
  EMPTY_DETAILS,
  KNOWN_OEMBED_ENDPOINTS,
  type DetailsResult,
  type DetailsSource,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";
import { fillMissing } from "./merge";
import { fetchOEmbed, oembedRequestUrl } from "./oembed";
import { fetchBilibiliDetails } from "./bilibili";
import { detailsFromLink } from "./link-details";
import { fetchLinkedInDetails } from "./linkedin";
import { fetchPageDetails } from "./page";
import { titleFromShareText } from "./share-text";
import { fetchWikipediaDetails } from "./wikipedia";
import { fetchYouTubeDetails } from "./youtube";

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
 * text, then what the link itself says (profile names, post dates). Never throws: whatever can't be found stays `null` for the form
 * to fill in.
 */
export async function fetchDetails(
  input: DetailsInput,
): Promise<DetailsResult> {
  const { commonPlatform, resolvedUrl, normalizedUrl } = input;
  const shareText: Layer = [
    { title: titleFromShareText(input.pastedText, input.url) },
    "share_text",
  ];
  const layers: Layer[] = commonPlatform
    ? [
        ...(await platformLayers(commonPlatform, resolvedUrl, normalizedUrl)),
        shareText,
        [detailsFromLink(commonPlatform, normalizedUrl), "link"],
      ]
    : [...pageLayers(await fetchPageDetails(resolvedUrl, null)), shareText];

  return layers.reduce<DetailsResult>(
    (result, [details, source]) => fillMissing(result, details, source),
    { details: { ...EMPTY_DETAILS }, sources: {} },
  );
}

type Layer = [details: Partial<ItemDetails> | null, source: DetailsSource];

/** A common platform's API, oEmbed and page details, best first. */
async function platformLayers(
  platform: CommonPlatform,
  resolvedUrl: string,
  normalizedUrl: string,
): Promise<Layer[]> {
  const known = KNOWN_OEMBED_ENDPOINTS[platform];
  const [api, oembed, page] = await Promise.all([
    fetchFromPlatformApi(platform, normalizedUrl),
    known
      ? fetchOEmbed(
          oembedRequestUrl(
            known.endpoint,
            known.link === "resolved"
              ? resolvedUrl
              : known.link === "normalized"
                ? normalizedUrl
                : known.link(normalizedUrl),
          ),
        )
      : null,
    fetchPageDetails(
      // Xiaohongshu pages only open with the token in the link as shared.
      platform === CommonPlatform.Xiaohongshu ? resolvedUrl : normalizedUrl,
      platform,
    ),
  ]);
  const rest: Layer[] = [[oembed, "oembed"], ...pageLayers(page)];
  return api ? [[api.details, api.source], ...rest] : rest;
}

/** Each of the page's fields, with the source it came from. */
function pageLayers(page: DetailsResult): Layer[] {
  return (Object.keys(page.sources) as (keyof ItemDetails)[]).map((field) => [
    { [field]: page.details[field] },
    page.sources[field]!,
  ]);
}

/** The platform's own API, for platforms that have one bluebook uses. */
async function fetchFromPlatformApi(
  platform: CommonPlatform,
  normalizedUrl: string,
): Promise<{ details: Partial<ItemDetails>; source: DetailsSource } | null> {
  const from = async (
    fetching: Promise<Partial<ItemDetails> | null>,
    source: DetailsSource,
  ) => {
    const details = await fetching;
    return details && { details, source };
  };
  switch (platform) {
    case CommonPlatform.YouTube:
      return from(fetchYouTubeDetails(normalizedUrl), "youtube_api");
    case CommonPlatform.Bilibili:
      return from(fetchBilibiliDetails(normalizedUrl), "bilibili_api");
    case CommonPlatform.Wikipedia:
      return from(fetchWikipediaDetails(normalizedUrl), "wikipedia_api");
    case CommonPlatform.LinkedIn:
      return from(fetchLinkedInDetails(normalizedUrl), "linkedin_embed");
    case CommonPlatform.X:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Instagram:
    case CommonPlatform.Spotify:
    case CommonPlatform.Reddit:
    case CommonPlatform.Goodreads:
      return null;
    default:
      return assertExhaustive(platform);
  }
}
