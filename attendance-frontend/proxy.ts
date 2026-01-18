import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public pages
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Protected role pages
  const token = req.cookies.get("att_token")?.value;
  const role = req.cookies.get("att_role")?.value;

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role guards
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  if (pathname.startsWith("/lecturer") && role !== "lecturer") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/lecturer/:path*", "/student/:path*"],
};

