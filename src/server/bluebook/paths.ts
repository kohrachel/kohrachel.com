import "server-only";
import { headers } from "next/headers";

const BLUEBOOK_HOST_PREFIX = "bluebook.";

/**
 * Where bluebook's pages start on this host: `""` on `bluebook.*`, where the
 * host rewrite adds `/bluebook`, and `"/bluebook"` anywhere else (Vercel
 * previews, `localhost`).
 */
export async function bluebookBasePath() {
  return (await host()).startsWith(BLUEBOOK_HOST_PREFIX) ? "" : "/bluebook";
}

async function host() {
  return (await headers()).get("host") ?? "";
}
