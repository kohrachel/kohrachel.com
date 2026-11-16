/** An ISO timestamp as a date input's value (`YYYY-MM-DD`, UTC), or `""`. */
export function dateInputValue(iso: string | null) {
  return iso?.slice(0, 10) ?? "";
}

/**
 * The publish date to save from a date input. Left as it was, the original
 * timestamp keeps its time; a date typed in is saved at midnight UTC.
 */
export function publishedAtFromInput(original: string | null, value: string) {
  if (value === dateInputValue(original)) return original;
  return value ? `${value}T00:00:00Z` : null;
}
