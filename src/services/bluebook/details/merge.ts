import {
  DETAIL_FIELDS,
  type DetailsResult,
  type DetailsSource,
  type ItemDetails,
} from "@/domain-types/bluebook/details";

/** Fills the fields `result` doesn't have yet from `details`. */
export function fillMissing(
  result: DetailsResult,
  details: Partial<ItemDetails> | null,
  source: DetailsSource,
): DetailsResult {
  if (!details) return result;
  const next: DetailsResult = {
    details: { ...result.details },
    sources: { ...result.sources },
  };
  for (const field of DETAIL_FIELDS) {
    const value = details[field];
    if (next.details[field] === null && value !== null && value !== undefined) {
      (next.details as Record<string, unknown>)[field] = value;
      next.sources[field] = source;
    }
  }
  return next;
}
