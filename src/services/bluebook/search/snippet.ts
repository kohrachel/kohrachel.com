import { SNIPPET_MAX_LENGTH } from "@/domain-types/bluebook/search";

const SENTENCE_END = /(?<=[。！？!?.…\n])\s*/;

/** A search's words, as typed: split on spaces. */
export function searchWords(query: string, max: number) {
  return query.split(/\s+/).filter(Boolean).slice(0, max);
}

/**
 * The sentence, from any of `texts`, that contains the most of `words`
 * (ignoring case), cut around the first match if it's long. Falls back to
 * the first sentence when none contains a word as typed.
 */
export function pickSnippet(texts: string[], words: string[]): string | null {
  const sentences = texts
    .flatMap((text) => text.split(SENTENCE_END))
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (!sentences.length) return null;

  const lowerWords = words.map((word) => word.toLowerCase());
  const scored = sentences.map((sentence) => ({
    sentence,
    score: lowerWords.filter((word) => sentence.toLowerCase().includes(word))
      .length,
  }));
  const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
  return cutAround(best.sentence, lowerWords);
}

function cutAround(sentence: string, lowerWords: string[]) {
  if (sentence.length <= SNIPPET_MAX_LENGTH) return sentence;
  const lower = sentence.toLowerCase();
  const firstMatch = Math.min(
    ...lowerWords.map((word) => lower.indexOf(word)).filter((i) => i >= 0),
  );
  const center = Number.isFinite(firstMatch) ? firstMatch : 0;
  const start = Math.max(
    0,
    Math.min(
      center - SNIPPET_MAX_LENGTH / 2,
      sentence.length - SNIPPET_MAX_LENGTH,
    ),
  );
  const end = start + SNIPPET_MAX_LENGTH;
  return `${start > 0 ? "…" : ""}${sentence.slice(start, end).trim()}${end < sentence.length ? "…" : ""}`;
}
