import { cleanText } from "./page-meta";

/** Suffixes apps add to titles in share text, such as Bilibili's "-哔哩哔哩". */
const SHARE_TITLE_SUFFIXES = [/[-_]哔哩哔哩(?:_bilibili)?$/i];

/**
 * A title from the text around a pasted link, such as Bilibili's
 * `【title-哔哩哔哩】 https://b23.tv/…`. Only text in 【】 before the link
 * counts; anything else in share text is usually boilerplate.
 */
export function titleFromShareText(text: string, url: string): string | null {
  const before = text.slice(0, Math.max(text.indexOf(url), 0));
  const bracketed = before.match(/【([^【】]+)】/)?.[1];
  const title = cleanText(bracketed);
  if (!title) return null;
  return cleanText(
    SHARE_TITLE_SUFFIXES.reduce(
      (trimmed, suffix) => trimmed.replace(suffix, ""),
      title,
    ),
  );
}
