import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function adminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function sign(secret: string, expiresAt: number): string {
  return createHmac("sha256", secret)
    .update(`admin_session:${expiresAt}`)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function checkPassword(password: string): boolean {
  const secret = adminSecret();
  return secret !== null && safeEqual(password, secret);
}

export async function createSession() {
  const secret = adminSecret();
  if (!secret) throw new Error("ADMIN_SECRET is not set");

  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  (await cookies()).set(COOKIE_NAME, `${expiresAt}.${sign(secret, expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function hasSession(): Promise<boolean> {
  const secret = adminSecret();
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!secret || !value) return false;

  const [expiresAtRaw, signature] = value.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt) || !signature) return false;
  if (expiresAt < Date.now() / 1000) return false;

  return safeEqual(signature, sign(secret, expiresAt));
}
