import "server-only";
import { findSetupLinkService } from "@/services/bluebook/auth/setup";

export async function getSetupLink(token: string) {
  return findSetupLinkService(token);
}
