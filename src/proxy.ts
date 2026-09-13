import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Gate the editor behind development mode. In production, requests to
// `/editor` are rewritten to the app's not-found page so prod users
// can't reach it.
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.rewrite(new URL("/_not-found", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/editor/:path*",
}
