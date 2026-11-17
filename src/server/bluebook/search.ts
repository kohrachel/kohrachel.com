import "server-only";
import type { SearchInput } from "@/domain-types/bluebook/search";
import {
  searchFiltersService,
  searchItemsService,
} from "@/services/bluebook/search/search";

export async function searchItems(input: SearchInput) {
  return searchItemsService(input);
}

export async function searchFilters() {
  return searchFiltersService();
}
