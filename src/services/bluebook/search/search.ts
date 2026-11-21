import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import type { DatePrecision } from "@/domain-types/bluebook/add";
import {
  OTHER_PLATFORMS,
  SEARCH_LIMIT,
  SEARCH_MAX_WORDS,
  type SearchFilters,
  type SearchInput,
  type SearchResult,
} from "@/domain-types/bluebook/search";
import {
  COMMON_PLATFORM_NAMES,
  CommonPlatform,
} from "@/domain-types/bluebook/links";
import {
  absoluteHttpUrl,
  positiveNumber,
} from "@/services/bluebook/details/page-meta";
import { platformGroup } from "@/services/bluebook/links/platform";
import { pickSnippet, searchWords } from "./snippet";

type Row = {
  id: string;
  title: string;
  creator: string | null;
  platform: string;
  is_favorite: boolean;
  thumbnail_url: unknown;
  duration_seconds: unknown;
  width: unknown;
  height: unknown;
  thumbnail_width: unknown;
  thumbnail_height: unknown;
  last_consumed_on: string | null;
  last_consumed_precision: DatePrecision | null;
  matched_texts: string[];
};

/** On this platform: the domain itself or one of its subdomains. */
const onPlatform = (domain: string) =>
  sql`(i.platform = ${domain} or i.platform like ${`%.${domain}`})`;

const onAnyCommonPlatform = sql`(${sql.join(
  Object.values(CommonPlatform).map(onPlatform),
  sql` or `,
)})`;

/**
 * Items that aren't deleted, matching the filters and every word of the
 * query (in the title, creator, platform or an entry's text), with the
 * best-matching sentence from their entries. Title matches come first,
 * then the most recently added-to.
 */
export async function searchItemsService({
  query = "",
  platforms = [],
  year,
  favoritesOnly = false,
  viewerId = null,
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
  if (platforms.length) {
    conditions.push(
      any(
        platforms.map((platform) =>
          platform === OTHER_PLATFORMS
            ? sql`not ${onAnyCommonPlatform}`
            : onPlatform(platform),
        ),
      ),
    );
  }
  if (year) {
    conditions.push(
      sql`exists (select 1 from bluebook.entries y where y.item_id = i.id
        and y.consumed_on >= ${`${year}-01-01`}::date
        and y.consumed_on < ${`${year + 1}-01-01`}::date)`,
    );
  }
  const isFavorite =
    viewerId === null
      ? sql`false`
      : sql`exists (select 1 from bluebook.favorites f
          where f.item_id = i.id and f.user_id = ${viewerId})`;
  if (favoritesOnly && viewerId !== null) conditions.push(isFavorite);

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

  const { rows } = await db.execute<Row>(sql`
    select i.id, i.title, i.creator, i.platform, ${isFavorite} as is_favorite,
      i.metadata->'thumbnailUrl' as thumbnail_url,
      i.metadata->'durationSeconds' as duration_seconds,
      i.metadata->'width' as width,
      i.metadata->'height' as height,
      i.metadata->'thumbnailWidth' as thumbnail_width,
      i.metadata->'thumbnailHeight' as thumbnail_height,
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
  `);

  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    creator: row.creator,
    platform: row.platform,
    isFavorite: row.is_favorite,
    thumbnailUrl: httpUrl(row.thumbnail_url),
    durationSeconds:
      typeof row.duration_seconds === "number"
        ? positiveNumber(row.duration_seconds)
        : null,
    thumbnailSize: size(row.thumbnail_width, row.thumbnail_height),
    videoSize: size(row.width, row.height),
    lastConsumed:
      row.last_consumed_on && row.last_consumed_precision
        ? { on: row.last_consumed_on, precision: row.last_consumed_precision }
        : null,
    snippet: words.length ? pickSnippet(row.matched_texts, words) : null,
  }));
}

/** A full http(s) link, or `null`. */
function httpUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
    ? absoluteHttpUrl(value, value)
    : null;
}

function size(width: unknown, height: unknown) {
  const w = typeof width === "number" ? positiveNumber(width) : null;
  const h = typeof height === "number" ? positiveNumber(height) : null;
  return w && h ? { width: w, height: h } : null;
}

/**
 * The common platforms there's something on (by name), whether anything is
 * on other sites, and the years with entries, newest first.
 */
export async function searchFiltersService(): Promise<SearchFilters> {
  const { rows: platformRows } = await db.execute<{ platform: string }>(sql`
    select distinct platform from bluebook.items where deleted_at is null`);
  const { rows: yearRows } = await db.execute<{ year: number }>(sql`
    select distinct extract(year from e.consumed_on)::int as year
    from bluebook.entries e
    join bluebook.items i on i.id = e.item_id and i.deleted_at is null
    order by year desc`);
  const groups = new Set(
    platformRows.map((row) => platformGroup(row.platform)),
  );
  const common = Object.values(CommonPlatform).filter((platform) =>
    groups.has(platform),
  );
  return {
    platforms: common.sort((a, b) =>
      COMMON_PLATFORM_NAMES[a].localeCompare(COMMON_PLATFORM_NAMES[b]),
    ),
    hasOtherPlatforms: groups.size > common.length,
    years: yearRows.map((row) => row.year),
  };
}
