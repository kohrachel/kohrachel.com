import { assertExhaustive } from "@/lib/utils";
import {
  ID_TIMESTAMP_EPOCH_MS,
  X_FIRST_TIMESTAMP_ID,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import { CommonPlatform } from "@/domain-types/bluebook/links";

/**
 * Details that can be read from a cleaned link alone, for when nothing better
 * can be fetched: a title for profiles (`r/sysadmin`, `u/someone`, `@jack`)
 * and, for LinkedIn and X posts, the date their id was created.
 */
export function detailsFromLink(
  platform: CommonPlatform,
  normalizedUrl: string,
): Partial<ItemDetails> {
  const url = new URL(normalizedUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  const [first, second] = segments;
  switch (platform) {
    case CommonPlatform.Reddit:
      if (first === "r" && second) return { title: `r/${second}` };
      if (first === "user" && second) return { title: `u/${second}` };
      return {};
    case CommonPlatform.X:
      // `/i/status/<id>`; profiles are the only one-segment links.
      if (first === "i" && second === "status" && segments[2]) {
        return { publishedAt: xIdDate(segments[2]) };
      }
      return segments.length === 1 ? { title: `@${first}` } : {};
    case CommonPlatform.Instagram:
      return segments.length === 1 ? { title: `@${first}` } : {};
    case CommonPlatform.YouTube:
      return first?.startsWith("@") && segments.length === 1
        ? { title: first }
        : {};
    case CommonPlatform.LinkedIn: {
      // A comment's own id comes first in its urn; otherwise the post's id.
      const id =
        url.searchParams
          .get("dashCommentUrn")
          ?.match(/^urn:li:fsd_comment:\((\d+),/)?.[1] ??
        url.pathname.match(/^\/feed\/update\/urn:li:\w+:(\d+)/)?.[1];
      return id
        ? { publishedAt: idDate(id, ID_TIMESTAMP_EPOCH_MS.linkedin) }
        : {};
    }
    case CommonPlatform.Bilibili:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Spotify:
    case CommonPlatform.Goodreads:
    case CommonPlatform.Wikipedia:
      return {};
    default:
      return assertExhaustive(platform);
  }
}

function xIdDate(id: string) {
  return /^\d+$/.test(id) && BigInt(id) >= X_FIRST_TIMESTAMP_ID
    ? idDate(id, ID_TIMESTAMP_EPOCH_MS.x)
    : null;
}

/** The id shifted right 22 bits is milliseconds since `epochMs`. */
function idDate(id: string, epochMs: number) {
  const ms = Number(BigInt(id) >> BigInt(22)) + epochMs;
  const date = new Date(ms);
  // Ignore ids that would put the post outside a plausible range.
  return ms > Date.UTC(2003, 0, 1) && ms < Date.now() + 86_400_000
    ? date.toISOString()
    : null;
}
