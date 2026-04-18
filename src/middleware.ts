import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEV_ONLY_ROUTES = ["/editor"];

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const pathname = request.nextUrl.pathname;

  const isDevOnlyRoute = DEV_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isDevOnlyRoute && !isDev) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*"],
};
