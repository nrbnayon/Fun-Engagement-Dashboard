// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// CONSTANTS
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

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

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/verify-email",
];

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/help",
  "/faq",
];

const STATIC_FILE_PATTERNS = [
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/_next/",
  "/api/",
  "/images/",
  "/icons/",
  "/assets/",
  "/public/",
  "/static/",
];

// UTILITY FUNCTIONS
function matchesRoutes(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isStaticFile(pathname: string): boolean {
  if (pathname.includes(".") && !pathname.endsWith("/")) {
    const extension = pathname.split(".").pop()?.toLowerCase();
    const staticExtensions = [
      "ico",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "svg",
      "webp",
      "css",
      "js",
      "json",
      "xml",
      "txt",
      "pdf",
      "woff",
      "woff2",
      "ttf",
    ];
    return !!extension && staticExtensions.includes(extension);
  }
  return STATIC_FILE_PATTERNS.some((pattern) => pathname.startsWith(pattern));
}

function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return !!(accessToken?.trim() && refreshToken?.trim());
}

function createRedirectResponse(
  request: NextRequest,
  destination: string
): NextResponse {
  const url = new URL(destination, request.url);
  const response = NextResponse.redirect(url);
  addSecurityHeaders(response);
  return response;
}

function createNextResponse(): NextResponse {
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
}

function logMiddlewareActivity(
  method: string,
  pathname: string,
  action: string,
  isAuthenticated: boolean
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Middleware] ${method} ${pathname} | Auth: ${isAuthenticated} | Action: ${action}`
    );
  }
}

function handleProtectedRoute(
  request: NextRequest,
  pathname: string,
  userIsAuthenticated: boolean
): NextResponse | null {
  if (!userIsAuthenticated) {
    logMiddlewareActivity(
      request.method,
      pathname,
      "Redirect to login (not authenticated)",
      userIsAuthenticated
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  logMiddlewareActivity(
    request.method,
    pathname,
    "Access granted (authenticated)",
    userIsAuthenticated
  );
  return null;
}

function handleAuthRoute(
  request: NextRequest,
  pathname: string,
  userIsAuthenticated: boolean
): NextResponse | null {
  if (userIsAuthenticated) {
    logMiddlewareActivity(
      request.method,
      pathname,
      "Redirect to overview (already authenticated)",
      userIsAuthenticated
    );
    return createRedirectResponse(request, "/overview");
  }
  logMiddlewareActivity(
    request.method,
    pathname,
    "Access granted (not authenticated)",
    userIsAuthenticated
  );
  return null;
}

function handlePublicRoute(
  request: NextRequest,
  pathname: string,
  userIsAuthenticated: boolean
): NextResponse {
  logMiddlewareActivity(
    request.method,
    pathname,
    "Public route access",
    userIsAuthenticated
  );
  return createNextResponse();
}

function handleRootPath(
  request: NextRequest,
  userIsAuthenticated: boolean
): NextResponse {
  const destination = userIsAuthenticated ? "/overview" : "/login";
  logMiddlewareActivity(
    request.method,
    "/",
    `Redirect to ${destination}`,
    userIsAuthenticated
  );
  return createRedirectResponse(request, destination);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticFile(pathname)) return NextResponse.next();

  const userIsAuthenticated = isAuthenticated(request);

  if (pathname === "/") return handleRootPath(request, userIsAuthenticated);

  if (matchesRoutes(pathname, PROTECTED_ROUTES)) {
    const response = handleProtectedRoute(
      request,
      pathname,
      userIsAuthenticated
    );
    if (response) return response;
  } else if (matchesRoutes(pathname, AUTH_ROUTES)) {
    const response = handleAuthRoute(request, pathname, userIsAuthenticated);
    if (response) return response;
  } else if (matchesRoutes(pathname, PUBLIC_ROUTES)) {
    return handlePublicRoute(request, pathname, userIsAuthenticated);
  } else {
    if (process.env.NODE_ENV === "development")
      console.warn(`[Middleware] Unknown route: ${pathname}`);
    return handlePublicRoute(request, pathname, userIsAuthenticated);
  }

  return createNextResponse();
}

// New route segment configuration for Next.js 15
export const runtime = "edge"; // or "nodejs" based on your needs
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
