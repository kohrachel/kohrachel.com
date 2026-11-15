import "server-only";
import {
  DETAILS_MAX_JSON_BYTES,
  DETAILS_MAX_PAGE_BYTES,
  DETAILS_MAX_REDIRECTS,
  DETAILS_TIMEOUT_MS,
  DETAILS_USER_AGENT,
} from "@/domain-types/bluebook/details";
import { isPublicHttpUrl } from "@/services/bluebook/links/resolve";

export type FetchedText = {
  /** The address after redirects. */
  url: string;
  contentType: string;
  body: string;
};

/**
 * Fetches a public page or API response as text. Follows up to
 * `DETAILS_MAX_REDIRECTS` redirects, refusing any that lead to a private
 * address, gives up after `DETAILS_TIMEOUT_MS`, and reads at most `maxBytes`.
 * Returns `null` on any failure; callers fall through to the next source.
 */
export async function fetchText(
  url: string,
  {
    maxBytes = DETAILS_MAX_PAGE_BYTES,
    accept = "text/html,application/xhtml+xml",
  }: { maxBytes?: number; accept?: string } = {},
): Promise<FetchedText | null> {
  const signal = AbortSignal.timeout(DETAILS_TIMEOUT_MS);
  let current = url;
  try {
    for (let hop = 0; hop <= DETAILS_MAX_REDIRECTS; hop++) {
      if (!isPublicHttpUrl(new URL(current))) return null;
      const response = await fetch(current, {
        redirect: "manual",
        signal,
        headers: { "user-agent": DETAILS_USER_AGENT, accept },
      });

      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        await response.body?.cancel();
        current = new URL(location, current).toString();
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        return null;
      }
      return {
        url: current,
        contentType: response.headers.get("content-type") ?? "",
        body: await readText(response, maxBytes),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetches a public JSON API response. Returns `null` on any failure. */
export async function fetchJson<T>(url: string): Promise<T | null> {
  const fetched = await fetchText(url, {
    maxBytes: DETAILS_MAX_JSON_BYTES,
    accept: "application/json",
  });
  if (!fetched) return null;
  try {
    return JSON.parse(fetched.body) as T;
  } catch {
    return null;
  }
}

async function readText(response: Response, maxBytes: number) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (bytes < maxBytes) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    const chunk = value.subarray(0, maxBytes - bytes);
    bytes += chunk.byteLength;
    text += decoder.decode(chunk, { stream: true });
  }
  await reader.cancel();
  return text + decoder.decode();
}
