import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import type { DatePrecision } from "@/domain-types/bluebook/add";
import {
  SEARCH_LIMIT,
  SEARCH_MAX_WORDS,
  type SearchFilters,
  type SearchInput,
  type SearchResult,
} from "@/domain-types/bluebook/search";
import { platformGroup } from "@/services/bluebook/links/platform";
import { pickSnippet, searchWords } from "./snippet";

type Row = {
  id: string;
  title: string;
  creator: string | null;
  platform: string;
  is_favorite: boolean;
  last_consumed_on: string | null;
  last_consumed_precision: DatePrecision | null;
  matched_texts: string[];
};

/**
 * Items that aren't deleted, matching the filters and every word of the
 * query (in the title, creator, platform or an entry's text), with the
 * best-matching sentence from their entries. Title matches come first,
 * then the most recently added-to.
 */
export async function searchItemsService({
  query = "",
  platform,
  year,
  favoritesOnly = false,
  limit = SEARCH_LIMIT,
}: SearchInput): Promise<SearchResult[]> {
  const words = searchWords(query, SEARCH_MAX_WORDS);
  // Escaped, so "OR", "-" and quotes are searched for, not query syntax.
  const matches = (column: SQL, word: string) =>
    sql`${column} &@~ pgroonga_query_escape(${word})`;
  const any = (parts: SQL[]) =>
    parts.length ? sql`(${sql.join(parts, sql` or `)})` : sql`false`;
  const all = (parts: SQL[]) =>
    parts.length ? sql`(${sql.join(parts, sql` and `)})` : sql`false`;

  const conditions: SQL[] = [
    sql`i.deleted_at is null`,
    ...words.map((word) =>
      any([
        matches(sql`i.title`, word),
        matches(sql`i.creator`, word),
        matches(sql`i.platform`, word),
        sql`exists (select 1 from bluebook.entries m where m.item_id = i.id and ${matches(sql`m.plain_text`, word)})`,
      ]),
    ),
  ];
  if (platform) {
    conditions.push(
      sql`(i.platform = ${platform} or i.platform like ${`%.${platform}`})`,
    );
  }
  if (year) {
    conditions.push(
      sql`exists (select 1 from bluebook.entries y where y.item_id = i.id
        and y.consumed_on >= ${`${year}-01-01`}::date
        and y.consumed_on < ${`${year + 1}-01-01`}::date)`,
    );
  }
  if (favoritesOnly) conditions.push(sql`i.is_favorite`);

  const matchedTexts = words.length
    ? sql`array(
        select e.plain_text from bluebook.entries e
        where e.item_id = i.id
          and ${any(words.map((word) => matches(sql`e.plain_text`, word)))}
        order by e.consumed_on desc, e.id desc
        limit 5)`
    : sql`'{}'::text[]`;

  const titleFirst = words.length
    ? sql`${all(words.map((word) => matches(sql`i.title`, word)))} desc,`
    : sql``;

  const rows = (await db.execute(sql`
    select i.id, i.title, i.creator, i.platform, i.is_favorite,
      latest.consumed_on::text as last_consumed_on,
      latest.consumed_precision as last_consumed_precision,
      ${matchedTexts} as matched_texts
    from bluebook.items i
    left join lateral (
      select consumed_on, consumed_precision from bluebook.entries e
      where e.item_id = i.id
      order by e.consumed_on desc, e.id desc
      limit 1
    ) latest on true
    where ${all(conditions)}
    order by
      ${titleFirst}
      (select max(a.created_at) from bluebook.entries a where a.item_id = i.id) desc nulls last,
      i.id desc
    limit ${limit}
  `)) as unknown as Row[];

  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    creator: row.creator,
    platform: row.platform,
    isFavorite: row.is_favorite,
    lastConsumed:
      row.last_consumed_on && row.last_consumed_precision
        ? { on: row.last_consumed_on, precision: row.last_consumed_precision }
        : null,
    snippet: words.length ? pickSnippet(row.matched_texts, words) : null,
  }));
}

/** The platforms and years there's something to filter by, newest year first. */
export async function searchFiltersService(): Promise<SearchFilters> {
  const [platforms, years] = await Promise.all([
    db.execute(sql`
      select distinct platform from bluebook.items where deleted_at is null`),
    db.execute(sql`
      select distinct extract(year from e.consumed_on)::int as year
      from bluebook.entries e
      join bluebook.items i on i.id = e.item_id and i.deleted_at is null
      order by year desc`),
  ]);
  return {
    platforms: [
      ...new Set(
        (platforms as unknown as { platform: string }[]).map((row) =>
          platformGroup(row.platform),
        ),
      ),
    ].sort(),
    years: (years as unknown as { year: number }[]).map((row) => row.year),
  };
}
