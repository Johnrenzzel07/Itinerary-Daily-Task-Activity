import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/activities", "/status", "/settings", "/profile"];

/** Edge-safe session check — cookie presence only (no Node/next-auth imports). */
function hasSessionCookie(request: NextRequest) {
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  return cookieNames.some((name) => request.cookies.has(name));
}

export function middleware(request: NextRequest) {
  const isLoggedIn = hasSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/activities/:path*",
    "/status/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
  ],
};
