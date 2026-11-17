import Link from "next/link";
import { Suspense } from "react";
import { COMMON_PLATFORM_NAMES } from "@/domain-types/bluebook/links";
import {
  OTHER_PLATFORMS,
  searchParamsSchema,
  type SearchParams,
} from "@/domain-types/bluebook/search";
import { formatDate } from "@/lib/bluebook/format";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { searchFilters, searchItems } from "@/server/bluebook/search";
import { platformName } from "@/services/bluebook/links/platform";
import { SearchForm } from "./search-form";

type Props = PageProps<"/bluebook">;

export default function BluebookHome({ searchParams }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">bluebook</h1>
      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <Search searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Search({
  searchParams,
}: {
  searchParams: Props["searchParams"];
}) {
  const parsed = searchParamsSchema.safeParse(await searchParams);
  const params: SearchParams = parsed.success ? parsed.data : { platform: [] };
  const [basePath, filters, results] = await Promise.all([
    bluebookBasePath(),
    searchFilters(),
    searchItems({
      query: params.q,
      platforms: [...params.platform].sort(),
      year: params.year,
      favoritesOnly: params.fav === "1",
    }),
  ]);
  const filtered = !!(
    params.q ||
    params.platform.length ||
    params.year ||
    params.fav
  );
  const platformOptions = [
    ...filters.platforms.map((platform) => ({
      value: platform,
      label: COMMON_PLATFORM_NAMES[platform],
    })),
    ...(filters.hasOtherPlatforms
      ? [{ value: OTHER_PLATFORMS, label: "Other sites" }]
      : []),
  ];

  return (
    <>
      <SearchForm
        key={params.q ?? ""}
        basePath={basePath}
        params={params}
        platformOptions={platformOptions}
        years={filters.years}
      />

      {results.length === 0 ? (
        <p className="text-stone-500">
          {filtered ? "Nothing matches." : "Nothing saved yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5">
              <Link
                href={`${basePath}/item/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.title}
                {item.isFavorite && (
                  <span className="ml-1 text-amber-500">★</span>
                )}
              </Link>
              <p className="text-sm text-stone-500">
                {[
                  item.creator,
                  platformName(item.platform),
                  item.lastConsumed &&
                    formatDate(
                      item.lastConsumed.on,
                      item.lastConsumed.precision,
                    ),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.snippet && (
                <p className="text-sm text-stone-700">{item.snippet}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
