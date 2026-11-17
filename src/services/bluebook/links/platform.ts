import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import { commonPlatformForHost } from "./normalize";

/**
 * The platform an item is grouped under: a common platform's domain (so
 * `en.wikipedia.org` is `wikipedia.org`), or the item's own platform.
 */
export function platformGroup(platform: string) {
  return commonPlatformForHost(platform) ?? platform;
}

/** "YouTube" for a common platform, the domain for any other. */
export function platformName(platform: string) {
  const common = commonPlatformForHost(platform);
  return common ? COMMON_PLATFORM_NAMES[common] : platform;
}
