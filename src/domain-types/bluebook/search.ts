import { z } from "zod";
import type { DatePrecision } from "./add";
import type { CommonPlatform } from "./links";

/** The platform filter's value for every site that isn't a common platform. */
export const OTHER_PLATFORMS = "other";

/** Empty fields from the search form mean "not set". */
const emptyAsUnset = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** The homepage's search and filters, read from its address. */
export const searchParamsSchema = z.object({
  q: z.preprocess(emptyAsUnset, z.string().trim().max(200).optional()),
  platform: z.preprocess(
    (value) => [value ?? []].flat().filter((v) => v !== ""),
    z.array(z.string().max(100)).max(20),
  ),
  year: z.preprocess(
    emptyAsUnset,
    z.coerce.number().int().min(1900).max(2100).optional(),
  ),
  fav: z.preprocess(emptyAsUnset, z.literal("1").optional()),
});

export type SearchParams = z.output<typeof searchParamsSchema>;

export type SearchInput = {
  query?: string;
  platforms?: string[];
  year?: number;
  favoritesOnly?: boolean;
  limit?: number;
};

export type SearchResult = {
  id: number;
  title: string;
  creator: string | null;
  platform: string;
  isFavorite: boolean;
  lastConsumed: { on: string; precision: DatePrecision } | null;
  snippet: string | null;
};

export type SearchFilters = {
  platforms: CommonPlatform[];
  hasOtherPlatforms: boolean;
  years: number[];
};

export const SEARCH_LIMIT = 100;
/** Search words beyond this many are ignored. */
export const SEARCH_MAX_WORDS = 10;
/** Snippets longer than this are cut around the match. */
export const SNIPPET_MAX_LENGTH = 200;
