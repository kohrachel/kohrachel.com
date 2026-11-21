import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "bluebook_session";

export async function readSessionToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME)?.value || null;
}

/** Only from a server action: cookies can't be set while a page renders. */
export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
