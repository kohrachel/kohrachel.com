"use cache";

import { cacheLife, cacheTag } from "next/cache";
import type { SearchInput } from "@/domain-types/bluebook/search";
import { ITEM_LISTS_TAG } from "@/services/bluebook/items/cache-tags";
import {
  searchFiltersService,
  searchItemsService,
} from "@/services/bluebook/search/search";

export async function searchItems(input: SearchInput) {
  cacheTag(ITEM_LISTS_TAG);
  cacheLife("hours");
  return searchItemsService(input);
}

export async function searchFilters() {
  cacheTag(ITEM_LISTS_TAG);
  cacheLife("hours");
  return searchFiltersService();
}
