import { DEFAULT_EMBED_SIZE, EMBEDS } from "@/domain-types/bluebook/items";
import { positiveNumber } from "@/services/bluebook/details/page-meta";

export type Embed = { src: string; width: number; height: number };

/** The player for an item's video, or `null` if it doesn't play here. */
export function embedFor(
  normalizedUrl: string,
  metadata: Record<string, unknown>,
): Embed | null {
  for (const { link, player } of EMBEDS) {
    const match = normalizedUrl.match(link);
    if (!match) continue;
    const width = positiveNumber(metadata.width);
    const height = positiveNumber(metadata.height);
    return {
      src: player(match.slice(1).filter(Boolean)),
      ...(width && height ? { width, height } : DEFAULT_EMBED_SIZE),
    };
  }
  return null;
}
