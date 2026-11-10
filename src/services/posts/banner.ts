import { storage, BUCKETS } from "@/services/storage";

/** The halftone cloud image shown above every post (and in the editor). */
export function getPostBannerUrl() {
  return storage.getPublicUrl(BUCKETS.resources, "clouds-halftone.png");
}
