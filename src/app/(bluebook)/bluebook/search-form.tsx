"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SearchParams } from "@/domain-types/bluebook/search";
import { buttonClass, inputClass } from "./styles";

type Search = {
  query: string;
  platforms: string[];
  year?: number;
  favoritesOnly: boolean;
};

const chipClass =
  "flex cursor-pointer items-center rounded-full border border-stone-300 px-3 py-1 has-[:checked]:border-stone-900 has-[:checked]:bg-stone-900 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-stone-400";

/**
 * The homepage's search box and filters. Filters search as soon as they
 * change; typed text searches on Enter, once it's more than spaces, and ×
 * clears it. Everything lives in the address.
 */
export function SearchForm({
  basePath,
  params,
  platformOptions,
  years,
}: {
  basePath: string;
  params: SearchParams;
  platformOptions: { value: string; label: string }[];
  years: number[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(params.q ?? "");
  const [pending, startTransition] = useTransition();
  const home = basePath || "/";
  const current: Search = {
    query,
    platforms: params.platform,
    year: params.year,
    favoritesOnly: params.fav === "1",
  };
  const filtered =
    current.platforms.length > 0 || !!current.year || current.favoritesOnly;

  function search(next: Search) {
    const address = new URLSearchParams();
    if (next.query.trim()) address.set("q", next.query.trim());
    for (const platform of next.platforms) address.append("platform", platform);
    if (next.year) address.set("year", String(next.year));
    if (next.favoritesOnly) address.set("fav", "1");
    const queryString = address.toString();
    startTransition(() =>
      router.push(queryString ? `${home}?${queryString}` : home),
    );
  }

  return (
    <form
      action={home}
      role="search"
      className="flex flex-col gap-3 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        setQuery(trimmed);
        search({ ...current, query: trimmed });
      }}
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, creators and entries"
            aria-label="Search"
            enterKeyHint="search"
            className={`${inputClass} pr-8`}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search text"
              onClick={() => {
                setQuery("");
                search({ ...current, query: "" });
              }}
              className="absolute inset-y-0 right-0 px-2.5 text-lg leading-none text-stone-400 hover:text-stone-700"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" disabled={!query.trim()} className={buttonClass}>
          Search
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {platformOptions.map(({ value, label }) => (
          <label key={value} className={chipClass}>
            <input
              type="checkbox"
              name="platform"
              value={value}
              checked={current.platforms.includes(value)}
              onChange={(event) =>
                search({
                  ...current,
                  platforms: event.target.checked
                    ? [...current.platforms, value]
                    : current.platforms.filter((p) => p !== value),
                })
              }
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          name="year"
          value={current.year ?? ""}
          onChange={(event) =>
            search({
              ...current,
              year: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          aria-label="Year watched or read"
          className="rounded-md border border-stone-300 bg-transparent px-2 py-1"
        >
          <option value="">Any year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <label className={chipClass}>
          <input
            type="checkbox"
            name="fav"
            value="1"
            checked={current.favoritesOnly}
            onChange={(event) =>
              search({ ...current, favoritesOnly: event.target.checked })
            }
            className="sr-only"
          />
          ★ Favorites
        </label>
        {filtered && (
          <button
            type="button"
            onClick={() =>
              search({
                query,
                platforms: [],
                year: undefined,
                favoritesOnly: false,
              })
            }
            className="text-stone-500 underline"
          >
            Clear filters
          </button>
        )}
        {pending && <span className="text-stone-400">Searching…</span>}
      </div>
    </form>
  );
}
