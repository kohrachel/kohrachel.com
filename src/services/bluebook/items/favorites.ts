import "server-only";
import { and, eq } from "drizzle-orm";
import type { db } from "@/db";
import { favorites } from "@/db/schema";

type Executor = Pick<typeof db, "insert" | "delete">;

/** Stars or unstars an item for one user. */
export async function setUserFavorite(
  executor: Executor,
  userId: number,
  itemId: number,
  isFavorite: boolean,
) {
  if (isFavorite) {
    await executor
      .insert(favorites)
      .values({ userId, itemId })
      .onConflictDoNothing();
  } else {
    await executor
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)));
  }
}
