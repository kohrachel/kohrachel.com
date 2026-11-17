export function itemTag(id: number) {
  return `bluebook-item-${id}`;
}

/** Everything that lists items, such as search; any change to an item expires it. */
export const ITEM_LISTS_TAG = "bluebook-item-lists";
