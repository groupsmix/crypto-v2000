import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Protect /api/admin routes with X-Admin-Password header ---
  // NOTE: This check MUST come before the /admin check because
  // "/api/admin" also starts with "/admin" and would otherwise
  // be caught by the Basic Auth block.
  if (pathname.startsWith("/api/admin")) {
    if (!ADMIN_PASSWORD) {
      return NextResponse.next();
    }

    const headerPassword = request.headers.get("x-admin-password");
    if (headerPassword === ADMIN_PASSWORD) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Protect /admin pages with Basic Auth ---
  if (pathname.startsWith("/admin")) {
    if (!ADMIN_PASSWORD) {
      // No password configured — allow access (development mode)
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(" ");
      if (scheme === "Basic" && encoded) {
        const decoded = atob(encoded);
        const [, password] = decoded.split(":");
        if (password === ADMIN_PASSWORD) {
          return NextResponse.next();
        }
      }
    }

    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
