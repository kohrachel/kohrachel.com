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
 * Tidies details read from a common platform's page at `url` (the cleaned
 * link). Returns `null` when the page was a login or sign-up page instead of
 * the content.
 */
export function cleanPageDetails(
  platform: CommonPlatform,
  details: ItemDetails,
  url: string,
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

  return {
    ...details,
    title,
    ...platformSpecific(platform, { ...details, title }, new URL(url)),
  };
}

function platformSpecific(
  platform: CommonPlatform,
  details: ItemDetails,
  url: URL,
): Partial<ItemDetails> {
  switch (platform) {
    case CommonPlatform.Bilibili: {
      if (url.hostname === "space.bilibili.com")
        return bilibiliSpace(details, url);
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
    case CommonPlatform.Spotify: {
      // Podcasts and audiobooks: "Podcast · Joe Rogan · The official podcast…".
      const host = details.description?.match(
        /^(?:Podcast|Audiobook)\s+·\s+([^·]+?)\s+·/,
      )?.[1];
      return details.creator || !host ? {} : { creator: cleanText(host) };
    }
    case CommonPlatform.YouTube:
    case CommonPlatform.X:
    case CommonPlatform.Xiaohongshu:
    case CommonPlatform.Instagram:
    case CommonPlatform.Reddit:
    case CommonPlatform.Goodreads:
    case CommonPlatform.Wikipedia:
    case CommonPlatform.LinkedIn:
      return {};
    default:
      return assertExhaustive(platform);
  }
}

/**
 * Every page on space.bilibili.com is titled after the uploader:
 * "X的个人空间-X个人主页-哔哩哔哩视频". On the uploader's own page that's the
 * title; on a favorites folder or collection it's only the owner, and the
 * folder's own name isn't in the page.
 */
function bilibiliSpace(details: ItemDetails, url: URL): Partial<ItemDetails> {
  const owner = cleanText(details.title?.match(/^(.+?)的个人空间/)?.[1]);
  const isProfile = !/\/(?:favlist|lists)(?:\/|$)/.test(url.pathname);
  return isProfile
    ? { title: owner ?? details.title, creator: owner }
    : { title: null, creator: owner, description: null, thumbnailUrl: null };
}
