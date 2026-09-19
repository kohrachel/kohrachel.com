import "server-only";
import { connection } from "next/server";

/**
 * Dummy "random" data source. This is the impure boundary kept out of render
 * so components stay pure. `connection()` opts the caller into dynamic
 * rendering so a fresh value is produced on every request (i.e. each refresh).
 */
export async function getRandomNumber(): Promise<number> {
  await connection();
  return Math.random();
}
