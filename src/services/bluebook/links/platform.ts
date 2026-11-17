import {
  COMMON_PLATFORM_NAMES,
  CommonPlatform,
} from "@/domain-types/bluebook/links";
import { commonPlatformForHost } from "./normalize";

const COMMON_PLATFORMS: readonly string[] = Object.values(CommonPlatform);

/**
 * The platform an item is grouped under: a common platform's domain (so
 * `en.wikipedia.org` is `wikipedia.org`), or the item's own platform.
 */
export function platformGroup(platform: string) {
  return commonPlatformForHost(platform) ?? platform;
}

/** "YouTube" for a common platform or its group, the domain for any other. */
export function platformName(platform: string) {
  const common = COMMON_PLATFORMS.includes(platform)
    ? (platform as CommonPlatform)
    : commonPlatformForHost(platform);
  return common ? COMMON_PLATFORM_NAMES[common] : platform;
}
