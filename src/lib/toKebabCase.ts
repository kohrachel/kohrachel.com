import { useMemo } from "react";

const KEBAB_REGEX = /\p{Lu}/gu;
const UNSAFE_PATH_CHARS = /[\/\\:*?"<>|]/g;

/**
 * Converts a string to kebab-case.
 * - Lowercases Unicode capitals via \p{Lu}
 * - Collapses whitespace to single hyphens
 * - Strips unsafe path characters
 * - Collapses repeated hyphens and trims leading/trailing hyphens
 * - Falls back to "untitled" if result is empty
 */
export function toKebabCase(title: string): string {
  return title
    .replace(KEBAB_REGEX, (match) => match.toLowerCase())
    .replace(/\s+/g, "-")
    .replace(UNSAFE_PATH_CHARS, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
