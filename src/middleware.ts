// src/middleware.ts - Remove the config export
import { NextRequest, NextResponse } from "next/server";

// =====================================================================
// CONSTANTS
// =====================================================================

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

// Protected routes - these require authentication
export const PROTECTED_ROUTES = [
  "/overview",
  "/profile",
  "/settings",
  "/admin",
  "/advertisements",
  "/components",
  "/fan-ranking",
  "/matches",
  "/news",
  "/player-list",
  "/voting",
];

// Authentication routes - redirect to overview if already logged in
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/verify-email",
];

// Public routes - accessible to everyone
const PUBLIC_ROUTES = [
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/help",
  "/faq",
];

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Check if the pathname matches any of the given route patterns
 */
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;
    // Dynamic route match (e.g., /profile/settings matches /profile)
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Validate JWT token format (basic structure check)
 */
function isValidJWTFormat(token: string): boolean {
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtPattern.test(token);
}

/**
 * Check if user is authenticated based on cookies
 */
function isAuthenticated(request: NextRequest): boolean {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("🔍 [AUTH] Checking authentication...");
  }

  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE);
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE);

    if (isDev) {
      console.log(
        "🍪 [AUTH] Access Token:",
        accessToken?.value ? "✅ Present" : "❌ Missing"
      );
      console.log(
        "🍪 [AUTH] Refresh Token:",
        refreshToken?.value ? "✅ Present" : "❌ Missing"
      );
    }

    // Check if cookies exist and have valid values
    const hasAccessToken =
      accessToken && accessToken.value && accessToken.value.trim().length > 0;
    const hasRefreshToken =
      refreshToken &&
      refreshToken.value &&
      refreshToken.value.trim().length > 0;

    if (!hasAccessToken || !hasRefreshToken) {
      if (isDev) console.log("❌ [AUTH] Missing required tokens");
      return false;
    }

    // Additional JWT format validation
    const accessTokenValid = isValidJWTFormat(accessToken.value);
    const refreshTokenValid = isValidJWTFormat(refreshToken.value);

    if (!accessTokenValid || !refreshTokenValid) {
      if (isDev) console.log("❌ [AUTH] Invalid token format");
      return false;
    }

    if (isDev) console.log("✅ [AUTH] Authentication successful");
    return true;
  } catch (error) {
    console.error("💥 [AUTH] Authentication check failed:", error);
    return false;
  }
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Only in production, add HSTS
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

/**
 * Create secure redirect response
 */
function createRedirectResponse(
  request: NextRequest,
  destination: string
): NextResponse {
  const url = new URL(destination, request.url);
  const response = NextResponse.redirect(url);
  addSecurityHeaders(response);
  return response;
}

/**
 * Create secure next response
 */
function createNextResponse(): NextResponse {
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

// =====================================================================
// MAIN MIDDLEWARE FUNCTION
// =====================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log(`\n🚀 [MIDDLEWARE] ${method} ${pathname}`);
  }

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    (pathname.includes(".") && !pathname.endsWith("/"))
  ) {
    return NextResponse.next();
  }

  try {
    // Check user authentication status
    const userIsAuthenticated = isAuthenticated(request);

    // Handle root path
    if (pathname === "/") {
      const destination = userIsAuthenticated ? "/overview" : "/login";
      if (isDev) console.log(`🏠 [MIDDLEWARE] Root redirect → ${destination}`);
      return createRedirectResponse(request, destination);
    }

    // 🔒 PROTECTED ROUTES - STRICT ENFORCEMENT
    if (matchesRoutes(pathname, PROTECTED_ROUTES)) {
      if (isDev) console.log(`🔒 [MIDDLEWARE] Protected route: ${pathname}`);

      if (!userIsAuthenticated) {
        if (isDev)
          console.log(`🚫 [MIDDLEWARE] Access denied → Redirecting to login`);

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isDev) console.log(`✅ [MIDDLEWARE] Access granted`);
      return createNextResponse();
    }

    // 🚪 AUTHENTICATION ROUTES
    if (matchesRoutes(pathname, AUTH_ROUTES)) {
      if (isDev) console.log(`🚪 [MIDDLEWARE] Auth route: ${pathname}`);

      if (userIsAuthenticated) {
        if (isDev)
          console.log(`↩️  [MIDDLEWARE] Already authenticated → overview`);
        return createRedirectResponse(request, "/overview");
      }

      return createNextResponse();
    }

    // 🌍 PUBLIC ROUTES
    if (matchesRoutes(pathname, PUBLIC_ROUTES)) {
      if (isDev) console.log(`🌍 [MIDDLEWARE] Public route: ${pathname}`);
      return createNextResponse();
    }

    // 🛡️ UNKNOWN ROUTES - DEFAULT TO PROTECTED FOR SECURITY
    if (isDev)
      console.log(
        `❓ [MIDDLEWARE] Unknown route: ${pathname} - treating as protected`
      );

    if (!userIsAuthenticated) {
      if (isDev) console.log(`🚫 [MIDDLEWARE] Unknown route blocked`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return createNextResponse();
  } catch (error) {
    console.error("💥 [MIDDLEWARE] Critical error:", error);
    return createNextResponse();
  }
}

// =====================================================================
// CREATE SEPARATE FILE: src/middleware.config.ts
// =====================================================================
