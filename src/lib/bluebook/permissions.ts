import type { CurrentUser } from "@/domain-types/bluebook/auth";

export type Actor = Pick<CurrentUser, "id" | "role">;

/** Owners and admins can change anyone's entries and delete any item. */
export function isElevated(actor: Pick<CurrentUser, "role">): boolean {
  return actor.role === "owner" || actor.role === "admin";
}

export function canEditEntry(actor: Actor, authorId: number): boolean {
  return isElevated(actor) || actor.id === authorId;
}

/** Deleting an item takes everyone's entries with it, so members can only delete items they alone logged. */
export function canDeleteItem(actor: Actor, authorIds: number[]): boolean {
  return isElevated(actor) || authorIds.every((id) => id === actor.id);
}
