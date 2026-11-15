import { REDIRECT_WRAPPERS } from "@/domain-types/bluebook/links";

const MAX_UNWRAPS = 3;

/** Replaces "you're leaving this site" links with the link they carry. */
export function unwrapRedirect(input: string): string {
  let current = input;
  for (let i = 0; i < MAX_UNWRAPS; i++) {
    const url = new URL(current);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    const inner = REDIRECT_WRAPPERS.filter(
      (w) => w.host === host && w.path === path,
    )
      .map((w) => url.searchParams.get(w.param))
      .find((value) => value && URL.canParse(value));
    if (!inner) return current;
    current = inner;
  }
  return current;
}
