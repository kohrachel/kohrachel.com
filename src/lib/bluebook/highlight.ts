export type HighlightPart = { text: string; hit: boolean };

/** `text` split into the stretches that match any of `words` (ignoring case) and the rest. */
export function highlightParts(text: string, words: string[]): HighlightPart[] {
  const pattern = words
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!pattern) return [{ text, hit: false }];
  return text
    .split(new RegExp(`(${pattern})`, "giu"))
    .filter(Boolean)
    .map((part) => ({
      text: part,
      hit: words.some((word) => word.toLowerCase() === part.toLowerCase()),
    }));
}
