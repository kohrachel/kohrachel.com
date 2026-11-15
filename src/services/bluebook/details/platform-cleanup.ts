import { assertExhaustive } from "@/lib/utils";
import {
  LOGIN_PAGE_TITLE,
  PLATFORM_TITLE_SUFFIXES,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import {
  COMMON_PLATFORM_NAMES,
  CommonPlatform,
} from "@/domain-types/bluebook/links";
import { cleanText } from "./page-meta";

/**
 * Tidies details read from a common platform's page. Returns `null` when the
 * page was a login or sign-up page instead of the content.
 */
export function cleanPageDetails(
  platform: CommonPlatform,
  details: ItemDetails,
): ItemDetails | null {
  if (details.title && LOGIN_PAGE_TITLE.test(details.title)) return null;

  let title = details.title;
  const suffix = PLATFORM_TITLE_SUFFIXES[platform];
  if (title && suffix) title = cleanText(title.replace(suffix, ""));
  // Some platforms show only their own name instead of the real title.
  const names = [COMMON_PLATFORM_NAMES[platform], platform].map((n) =>
    n.toLowerCase(),
  );
  if (title && names.includes(title.toLowerCase())) title = null;

  return { ...details, title, ...platformSpecific(platform, details) };
}

function platformSpecific(
  platform: CommonPlatform,
  details: ItemDetails,
): Partial<ItemDetails> {
  switch (platform) {
    case CommonPlatform.Bilibili: {
      // "<description>, 视频播放量 69998、弹幕量 5、…": the counts aren't part of
      // the description, and "-" means there isn't one.
      const description = details.description?.split(/,\s*视频播放量/)[0];
      return {
        description:
          description && description.trim() !== "-"
            ? cleanText(description)
            : null,
      };
    }
    case CommonPlatform.YouTube:
    case CommonPlatform.X:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Instagram:
    case CommonPlatform.Spotify:
    case CommonPlatform.Reddit:
    case CommonPlatform.Goodreads:
    case CommonPlatform.Wikipedia:
    case CommonPlatform.LinkedIn:
      return {};
    default:
      return assertExhaustive(platform);
  }
}
