import { assertExhaustive } from "@/lib/utils";
import {
  DETAILS_MAX_TITLE_LENGTH,
  LOGIN_PAGE_TITLE,
  PLATFORM_TITLE_SUFFIXES,
  type ItemDetails,
} from "@/domain-types/bluebook/details";
import {
  COMMON_PLATFORM_NAMES,
  CommonPlatform,
} from "@/domain-types/bluebook/links";
import { cleanText, toIsoDate, truncateText } from "./page-meta";

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
  // A LinkedIn comment's page shows the post it's on, so its details (text,
  // author, date) belong to the post, not the comment.
  if (
    platform === CommonPlatform.LinkedIn &&
    new URL(url).searchParams.has("dashCommentUrn")
  ) {
    return null;
  }

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
    case CommonPlatform.Instagram:
      return instagram(details);
    case CommonPlatform.YouTube:
    case CommonPlatform.X:
    case CommonPlatform.Xiaohongshu:
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

/**
 * Instagram's page text, for a post:
 * - title: `Name on Instagram: "caption…"`
 * - description: `33 likes, 0 comments - handle on November 15, 2026: "caption…"`
 * and for a profile, a description of follower counts instead of the bio.
 */
function instagram(details: ItemDetails): Partial<ItemDetails> {
  const post = details.title?.match(/^(.+?) on Instagram: "([\s\S]*?)"?$/);
  const meta = details.description?.match(
    /^[\d.,KMB]+ likes?, [\d.,KMB]+ comments? - \S+ on (.+?): "([\s\S]*?)"?$/,
  );
  if (post) {
    const caption = cleanText(meta?.[2] ?? post[2]);
    return {
      creator: cleanText(post[1]),
      title: truncateText(cleanText(post[2]), DETAILS_MAX_TITLE_LENGTH),
      description: caption,
      publishedAt: details.publishedAt ?? toIsoDate(meta?.[1] ?? null),
    };
  }
  // Profile: "Grace Gumala (@gracegumala)".
  const profile = details.title?.match(/^(.+?) \(@[\w.]+\)$/);
  return {
    creator: profile ? cleanText(profile[1]) : details.creator,
    description: /^[\d.,KMB]+ Followers,/.test(details.description ?? "")
      ? null
      : details.description,
  };
}
