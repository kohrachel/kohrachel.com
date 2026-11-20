import { highlightParts } from "@/lib/bluebook/highlight";

/** `text` with the words a search matched marked like a highlighter. */
export function Highlighted({
  text,
  words,
}: {
  text: string;
  words: string[];
}) {
  return highlightParts(text, words).map((part, index) =>
    part.hit ? (
      <mark key={index} className="bb-mark">
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}
