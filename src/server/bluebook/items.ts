"use cache";

import { getItemService } from "@/services/bluebook/items/get";

export async function getItem(id: number) {
  return getItemService(id);
}
