import "server-only";
import type { CommonPlatform } from "@/domain-types/bluebook/links";
import { extractUrl } from "./extract";
import { normalizeUrl } from "./normalize";
import { isPublicHttpUrl, isShortLink, resolveShortLink } from "./resolve";
import { unwrapRedirect } from "./unwrap";

export type CleanLinkResult =
  | {
      ok: true;
      /** The link as pasted, stored on the item as `url`. */
      url: string;
      /** `url` after unwrapping redirect pages and following short links. */
      resolvedUrl: string;
      normalizedUrl: string;
      /** `null` for any site that isn't a common platform. */
      commonPlatform: CommonPlatform | null;
    }
  | { ok: false; reason: "no_link" | "short_link_failed" }
  | {
      ok: false;
      reason: "unsupported_page";
      commonPlatform: CommonPlatform;
    };

/** Turns pasted text into a cleaned-up link, or the reason it can't be used. */
export async function cleanLink(text: string): Promise<CleanLinkResult> {
  const url = extractUrl(text);
  if (!url || !isPublicHttpUrl(new URL(url))) {
    return { ok: false, reason: "no_link" };
  }

  const unwrapped = unwrapRedirect(url);
  if (!isPublicHttpUrl(new URL(unwrapped))) {
    return { ok: false, reason: "no_link" };
  }
  const resolvedUrl = isShortLink(unwrapped)
    ? await resolveShortLink(unwrapped)
    : unwrapped;
  if (!resolvedUrl) return { ok: false, reason: "short_link_failed" };

  const normalized = normalizeUrl(resolvedUrl);
  return normalized.ok ? { ...normalized, url, resolvedUrl } : normalized;
}
