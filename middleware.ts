import { NextRequest, NextResponse } from "next/server";

const LOCALE_HEADER = "x-locale";
const NO_PREFIX = /^\/no(?=\/|$)/;

/**
 * Strip the /no URL prefix, rewrite to the un-prefixed route tree, and
 * stamp x-locale=no on the request so server components can fetch the
 * Norwegian variant of each field. English ("/") is the default and goes
 * through untouched with x-locale=en.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (NO_PREFIX.test(pathname)) {
    const stripped = pathname.replace(NO_PREFIX, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, "no");
    const response = NextResponse.rewrite(url, { request: { headers } });
    response.headers.set(LOCALE_HEADER, "no");
    return response;
  }
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, "en");
  void search;
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip Next internals, Studio, API, and static assets. Sanity Studio
  // (/studio/*) needs to render with the raw URL so it can edit content.
  matcher: [
    "/((?!_next/|api/|studio/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|ico|css|js|woff|woff2|ttf|map)).*)",
  ],
};
