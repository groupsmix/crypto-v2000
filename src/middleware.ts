import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Protect admin routes and admin API routes - require admin role
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return !!token && (token as { role?: string }).role === "admin";
        }

        // Protect dashboard routes - require authentication
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        // Allow all other routes
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};
