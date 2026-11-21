import Link from "next/link";
import { Suspense } from "react";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import {
  OTHER_PLATFORMS,
  SEARCH_MAX_WORDS,
  searchParamsSchema,
  type SearchParams,
} from "@/domain-types/bluebook/search";
import { canWrite } from "@/server/auth/gate";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { searchFilters, searchItems } from "@/server/bluebook/search";
import { searchWords } from "@/services/bluebook/search/snippet";
import { estimateCardHeight, ItemCard } from "./item-card";
import { MasonryGrid } from "./masonry-grid";
import { SearchForm } from "./search-form";

type Props = PageProps<"/bluebook">;

const LOADING_RATIOS = [
  16 / 11,
  3 / 4,
  16 / 9,
  2 / 3,
  4 / 3,
  1,
  16 / 12,
  3 / 4,
];

export default function BluebookHome({ searchParams }: Props) {
  return (
    <main className="bb-page">
      <Suspense fallback={<HomeLoading />}>
        <Home searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function HomeLoading() {
  return (
    <>
      <header className="bb-masthead">
        <span className="bb-wordmark">bluebook</span>
      </header>
      <MasonryGrid
        label="Loading"
        cells={LOADING_RATIOS.map((ratio, index) => ({
          key: index,
          height: 1 / ratio,
          node: <div className="bb-skel" style={{ aspectRatio: ratio }} />,
        }))}
      />
    </>
  );
}

async function Home({ searchParams }: { searchParams: Props["searchParams"] }) {
  const parsed = searchParamsSchema.safeParse(await searchParams);
  const params: SearchParams = parsed.success ? parsed.data : { platform: [] };
  const filtered = !!(
    params.q ||
    params.platform.length ||
    params.year ||
    params.fav
  );
  const basePath = await bluebookBasePath();
  const canAdd = await canWrite();
  const filters = await searchFilters();
  const results = await searchItems({
    query: params.q,
    platforms: [...params.platform].sort(),
    year: params.year,
    favoritesOnly: params.fav === "1",
  });
  const words = params.q ? searchWords(params.q, SEARCH_MAX_WORDS) : [];
  const platformOptions = [
    ...filters.platforms.map((platform) => ({
      value: platform,
      label: COMMON_PLATFORM_NAMES[platform],
    })),
    ...(filters.hasOtherPlatforms
      ? [{ value: OTHER_PLATFORMS, label: "Other sites" }]
      : []),
  ];
  const chipsOn = !!(params.platform.length || params.year || params.fav);

  return (
    <>
      <SearchForm
        key={params.q ?? ""}
        basePath={basePath}
        params={params}
        platformOptions={platformOptions}
        years={filters.years}
        canAdd={canAdd}
      />

      {filtered && results.length > 0 && (
        <div className="bb-results__head">
          <p className="bb-meta">{countLine(results.length, params)}</p>
        </div>
      )}

      {results.length === 0 ? (
        <div className="bb-empty">
          <span aria-hidden="true" className="bb-tape bb-tape--top" />
          <p className="bb-section-title">
            {filtered ? "Nothing but tumbleweeds..." : "Nothing saved yet."}
          </p>
          {filtered && (
            <Link
              href={chipsOn ? searchOnly(basePath, params.q) : basePath || "/"}
              className="bb-btn bb-btn--outline"
            >
              {chipsOn ? "Clear filters" : "Clear search"}
            </Link>
          )}
        </div>
      ) : (
        <MasonryGrid
          label={filtered ? "Results" : "Everything saved"}
          cells={results.map((item) => ({
            key: item.id,
            height: estimateCardHeight(item),
            node: (
              <ItemCard
                item={item}
                href={`${basePath}/item/${item.id}`}
                words={words}
              />
            ),
          }))}
        />
      )}
    </>
  );
}

/** "4 things match “grain” in 2026". */
function countLine(count: number, params: SearchParams) {
  const things = count === 1 ? "thing" : "things";
  const verb = count === 1 ? "matches" : "match";
  return [
    `${count} ${things}`,
    params.q && `${verb} “${params.q}”`,
    params.year && `in ${params.year}`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** The homepage with the same search text and no filters. */
function searchOnly(basePath: string, query: string | undefined) {
  const home = basePath || "/";
  const text = query?.trim();
  return text ? `${home}?${new URLSearchParams({ q: text })}` : home;
}
