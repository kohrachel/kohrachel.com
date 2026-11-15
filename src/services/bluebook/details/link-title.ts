import { assertExhaustive } from "@/lib/utils";
import { CommonPlatform } from "@/domain-types/bluebook/links";

/**
 * A title built from a profile link, for when nothing better can be fetched:
 * `r/sysadmin`, `u/someone`, `@jack`. `normalizedUrl` is the cleaned link,
 * so each platform's profile format is fixed.
 */
export function titleFromLink(
  platform: CommonPlatform,
  normalizedUrl: string,
): string | null {
  const segments = new URL(normalizedUrl).pathname.split("/").filter(Boolean);
  const [first, second] = segments;
  switch (platform) {
    case CommonPlatform.Reddit:
      if (first === "r" && second) return `r/${second}`;
      if (first === "user" && second) return `u/${second}`;
      return null;
    case CommonPlatform.X:
    case CommonPlatform.Instagram:
      // Profiles are the only one-segment links on these platforms.
      return segments.length === 1 ? `@${first}` : null;
    case CommonPlatform.YouTube:
      return first?.startsWith("@") && segments.length === 1 ? first : null;
    case CommonPlatform.Bilibili:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Spotify:
    case CommonPlatform.Goodreads:
    case CommonPlatform.Wikipedia:
    case CommonPlatform.LinkedIn:
      // Profile links on these use numeric ids or opaque handles.
      return null;
    default:
      return assertExhaustive(platform);
  }
}
