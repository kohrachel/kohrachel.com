import "server-only";

import {
  INTERSTITIAL_LINK_PATTERNS,
  INTERSTITIAL_MAX_BYTES,
  SHORT_LINK_HOSTS,
  SHORT_LINK_PATHS,
  SHORT_LINK_MAX_REDIRECTS as MAX_REDIRECTS,
  SHORT_LINK_TIMEOUT_MS as TIMEOUT_MS,
} from "@/domain-types/bluebook/links";

function bareHost(url: string) {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
}

export function isShortLink(url: string) {
  const host = bareHost(url);
  const { pathname } = new URL(url);
  return (
    SHORT_LINK_HOSTS.includes(host) ||
    SHORT_LINK_PATHS.some((p) => p.host === host && p.path.test(pathname))
  );
}

/**
 * Follows a short link's redirects to the page it points at. Only reads a
 * page for hosts in `INTERSTITIAL_LINK_PATTERNS`, and then only its start.
 * Returns `null` if it can't be resolved.
 */
export async function resolveShortLink(url: string): Promise<string | null> {
  let current = url;
  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "Mozilla/5.0 (compatible; bluebook)" },
    }).catch(() => null);
    if (!response) return null;

    const pattern = INTERSTITIAL_LINK_PATTERNS[bareHost(current)];
    const isRedirect = response.status >= 300 && response.status < 400;
    let location: string | null = null;
    if (response.status === 200 && pattern) {
      location = await findLinkInPage(response, pattern);
    } else {
      await response.body?.cancel();
      if (isRedirect) location = response.headers.get("location");
    }
    if (!location) return hop === 0 ? null : current;

    const next = new URL(location, current);
    if (!isPublicHttpUrl(next)) return null;
    current = next.toString();
    if (!isShortLink(current)) return current;
  }
  return null;
}

/** Reads the start of a page and returns the first match of `pattern`. */
async function findLinkInPage(response: Response, pattern: RegExp) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < INTERSTITIAL_MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value.subarray(0, INTERSTITIAL_MAX_BYTES - bytes);
    bytes += chunk.byteLength;
    html += decoder.decode(chunk, { stream: true });
    const match = html.match(pattern);
    if (match) {
      await reader.cancel();
      return match[1].replaceAll("&amp;", "&");
    }
  }
  await reader.cancel();
  return null;
}

/** Rejects non-HTTP schemes and addresses on this machine or a private network. */
export function isPublicHttpUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal")
  ) {
    return false;
  }
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  if (host.includes(":")) {
    return !(
      host === "::1" ||
      host === "::" ||
      /^(fc|fd|fe80)/.test(host) ||
      host.startsWith("::ffff:")
    );
  }
  return true;
}
