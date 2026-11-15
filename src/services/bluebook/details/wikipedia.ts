import "server-only";
import type { ItemDetails } from "@/domain-types/bluebook/details";
import { fetchJson } from "./fetch";
import { absoluteHttpUrl, cleanText } from "./page-meta";

type WikipediaSummary = {
  title?: unknown;
  extract?: unknown;
  thumbnail?: { source?: unknown };
};

/**
 * Details from Wikipedia's REST summary API, for a link in the form
 * `https://<lang>.wikipedia.org/wiki/<title>`. Articles have no author or
 * publish date, so only the title, lead paragraph and image are filled.
 */
export async function fetchWikipediaDetails(
  normalizedUrl: string,
): Promise<Partial<ItemDetails> | null> {
  const match = normalizedUrl.match(
    /^https:\/\/([a-z0-9-]+)\.wikipedia\.org\/wiki\/(.+)$/,
  );
  if (!match) return null;
  const [, language, title] = match;
  const data = await fetchJson<WikipediaSummary>(
    `https://${language}.wikipedia.org/api/rest_v1/page/summary/${title}`,
  );
  if (!data) return null;
  return {
    title: cleanText(data.title),
    description: cleanText(data.extract),
    thumbnailUrl: absoluteHttpUrl(
      cleanText(data.thumbnail?.source),
      normalizedUrl,
    ),
  };
}
