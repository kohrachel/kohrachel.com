"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { SearchParams } from "@/domain-types/bluebook/search";
import { Star } from "./star";

type Search = {
  query: string;
  platforms: string[];
  year?: number;
  favoritesOnly: boolean;
};

/**
 * The homepage's masthead (wordmark, search bar, Add) and filter chips,
 * with `favorites` between them. Filters search as soon as they change;
 * typed text searches on Enter, once it's more than spaces, and × clears
 * it. Everything lives in the address.
 */
export function SearchForm({
  basePath,
  params,
  platformOptions,
  years,
  canAdd,
  favorites,
}: {
  basePath: string;
  params: SearchParams;
  platformOptions: { value: string; label: string }[];
  years: number[];
  canAdd: boolean;
  favorites?: ReactNode;
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
    <>
      <header className="bb-masthead">
        <Link href={home} className="bb-wordmark">
          bluebook
        </Link>
        <form
          action={home}
          role="search"
          className="bb-search"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = query.trim();
            if (!trimmed) return;
            setQuery(trimmed);
            search({ ...current, query: trimmed });
          }}
        >
          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.8} aria-hidden />
          <input
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, creators and entries"
            aria-label="Search"
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search text"
              onClick={() => {
                setQuery("");
                search({ ...current, query: "" });
              }}
              className="bb-search__clear"
            >
              ×
            </button>
          )}
        </form>
        {canAdd && (
          <div className="bb-masthead__end">
            <Link href={`${basePath}/add`} className="bb-btn bb-btn--primary">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.8} />
              Add
            </Link>
          </div>
        )}
      </header>

      {favorites}

      <div className="bb-chips">
        {platformOptions.map(({ value, label }) => {
          const on = current.platforms.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() =>
                search({
                  ...current,
                  platforms: on
                    ? current.platforms.filter((p) => p !== value)
                    : [...current.platforms, value],
                })
              }
              className="bb-chip"
            >
              {label}
            </button>
          );
        })}
        <label className={`bb-chip ${current.year ? "bb-chip--on" : ""}`}>
          <span className="bb-sr">Year watched or read</span>
          <select
            name="year"
            value={current.year ?? ""}
            onChange={(event) =>
              search({
                ...current,
                year: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          >
            <option value="">Any year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-pressed={current.favoritesOnly}
          onClick={() =>
            search({ ...current, favoritesOnly: !current.favoritesOnly })
          }
          className="bb-chip"
        >
          <Star />
          Favorites
        </button>
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
            className="bb-btn bb-btn--quiet underline underline-offset-3"
          >
            Clear filters
          </button>
        )}
        {pending && <span className="bb-hint">Searching…</span>}
      </div>
    </>
  );
}
