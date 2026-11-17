import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { searchParamsSchema } from "@/domain-types/bluebook/search";
import { formatDate } from "@/lib/bluebook/format";
import { bluebookBasePath } from "@/server/bluebook/paths";
import { searchFilters, searchItems } from "@/server/bluebook/search";
import { platformName } from "@/services/bluebook/links/platform";
import { buttonClass, inputClass } from "./styles";

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
  const params = parsed.success ? parsed.data : {};
  const [basePath, filters, results] = await Promise.all([
    bluebookBasePath(),
    searchFilters(),
    searchItems({
      query: params.q,
      platform: params.platform,
      year: params.year,
      favoritesOnly: params.fav === "1",
    }),
  ]);
  const filtered = !!(params.q || params.platform || params.year || params.fav);

  return (
    <>
      <Form
        action={basePath || "/"}
        className="flex flex-col gap-2 text-sm"
        role="search"
      >
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={params.q}
            placeholder="Search titles, creators and entries"
            aria-label="Search"
            className={inputClass}
          />
          <button type="submit" className={buttonClass}>
            Search
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            name="platform"
            defaultValue={params.platform ?? ""}
            aria-label="Platform"
            className="rounded-md border border-stone-300 bg-transparent px-2 py-1"
          >
            <option value="">All platforms</option>
            {filters.platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platformName(platform)}
              </option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={params.year ?? ""}
            aria-label="Year watched or read"
            className="rounded-md border border-stone-300 bg-transparent px-2 py-1"
          >
            <option value="">Any year</option>
            {filters.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              name="fav"
              value="1"
              defaultChecked={params.fav === "1"}
            />
            Favorites
          </label>
          {filtered && (
            <Link href={basePath || "/"} className="text-stone-500 underline">
              Clear
            </Link>
          )}
        </div>
      </Form>

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
