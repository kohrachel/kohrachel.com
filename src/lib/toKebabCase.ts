/**
 * Converts a string to kebab-case.
 * - Lowercases Unicode capitals via \p{Lu}
 * - Collapses whitespace to single hyphens
 * - Strips unsafe path characters
 * - Collapses repeated hyphens and trims leading/trailing hyphens
 * - Falls back to "untitled" if result is empty
 */
export function toKebabCase(title: string): string {
  return (
    title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars (except -)
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+|-+$/g, "") || "untitled"
  );
}
