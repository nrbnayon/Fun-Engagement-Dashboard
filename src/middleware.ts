import { NextRequest, NextResponse } from "next/server";

// Simple route definitions
const protectedRoutes = [
  "/overview",
  "/advertisements",
  "/fan-ranking",
  "/matches",
  "/news",
  "/player-list",
  "/voting",
];

const authRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  return !!(accessToken?.value && refreshToken?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internals, API routes, and static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const userIsAuthenticated = isAuthenticated(request);

  // Redirect root to appropriate page
  if (pathname === "/") {
    const destination = userIsAuthenticated ? "/overview" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !userIsAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && userIsAuthenticated) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
