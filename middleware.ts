// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Constants
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/api/protected",
];

// Auth routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/api/public",
];

/**
 * Check if a route matches any of the given patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;
    
    // Wildcard match (e.g., /api/protected/* matches /api/protected/users)
    if (route.endsWith("/*")) {
      const baseRoute = route.slice(0, -2);
      return pathname.startsWith(baseRoute);
    }
    
    // Starts with match for nested routes
    return pathname.startsWith(route + "/");
  });
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error("[Middleware] Token verification failed:", error);
    return false;
  }
}

/**
 * Check if user is authenticated based on cookies
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  
  // Must have both tokens
  if (!accessToken || !refreshToken) {
    return false;
  }
  
  // Verify access token
  const isValidAccessToken = await verifyToken(accessToken);
  
  if (isValidAccessToken) {
    return true;
  }
  
  // If access token is invalid, check refresh token
  const isValidRefreshToken = await verifyToken(refreshToken);
  
  // If refresh token is valid, user is still authenticated
  // (The frontend will handle token refresh automatically)
  return isValidRefreshToken;
}

/**
 * Create redirect response with proper headers
 */
function createRedirect(request: NextRequest, destination: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = destination;
  
  const response = NextResponse.redirect(url);
  
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

/**
 * Create response with security headers
 */
function createSecureResponse(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NODE_ENV === "production" 
        ? "https://flash.zamansheikh.com" 
        : "http://localhost:3000"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,DELETE,PATCH,POST,PUT,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
  }
  
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function handleCORSPreflight(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NODE_ENV === "production" 
      ? "https://flash.zamansheikh.com" 
      : "http://localhost:3000"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  
  return response;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing: ${request.method} ${pathname}`);
  
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return handleCORSPreflight();
  }
  
  // Check authentication status
  const userIsAuthenticated = await isAuthenticated(request);
  
  console.log(`[Middleware] User authenticated: ${userIsAuthenticated}`);
  
  // Handle protected routes
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!userIsAuthenticated) {
      console.log(`[Middleware] Redirecting to login: ${pathname}`);
      
      // Store the attempted URL for redirect after login
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Handle auth routes (redirect to dashboard if already authenticated)
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (userIsAuthenticated) {
      console.log(`[Middleware] Redirecting to dashboard: ${pathname}`);
      return createRedirect(request, "/dashboard");
    }
  }
  
  // Handle API routes
  if (pathname.startsWith("/api/")) {
    // Protected API routes
    if (pathname.startsWith("/api/auth/profile") || 
        pathname.startsWith("/api/protected/")) {
      if (!userIsAuthenticated) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Unauthorized", 
            message: "Authentication required" 
          }),
          { 
            status: 401,
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
      }
    }
    
    // Add security headers to API responses
    return createSecureResponse(request);
  }
  
  // Add security headers to all responses
  return createSecureResponse(request);
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|images/|icons/).*)",
  ],
};