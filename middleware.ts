import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/activities", "/status", "/settings", "/profile"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/activities/:path*", "/status/:path*", "/settings/:path*", "/profile/:path*", "/login"],
};
