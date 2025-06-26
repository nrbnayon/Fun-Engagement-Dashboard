// lib/axios.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";

// Constants
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

// Token expiration: 1 year (365 days)
const TOKEN_EXPIRY_DAYS = 365;

// Types
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Create a configured axios instance with interceptors for authentication
 */
const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
    ...config,
  });

  // Variables to track token refresh state
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  /**
   * Process the queue of failed requests after token refresh
   */
  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((request) => {
      if (error) {
        request.reject(error);
      } else if (token) {
        if (request.config.headers) {
          request.config.headers["Authorization"] = `Bearer ${token}`;
        }
        request.resolve(instance(request.config));
      }
    });
    failedQueue = [];
  };

  // Request interceptor - Add auth token to headers
  instance.interceptors.request.use(
    (config) => {
      const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);
      if (accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Add request timestamp for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            data: config.data,
          }
        );
      }

      return config;
    },
    (error) => {
      console.error("[API Request Error]", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token refresh and errors
  instance.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[API Response] ${response.status} ${response.config.url}`,
          {
            data: response.data,
          }
        );
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("[API Response Error]", {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
      }

      // Handle non-401 errors or already retried requests
      if (
        !error.response ||
        error.response.status !== 401 ||
        originalRequest._retry
      ) {
        return Promise.reject(createApiError(error));
      }

      // Queue request if already refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Refresh token request
        const { data }: AxiosResponse<AuthTokens> = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Save new tokens
        saveTokens(data);

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
        }

        // Process queued requests
        processQueue(null, data.accessToken);

        // Retry original request
        return instance(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure
        processQueue(refreshError as Error);
        handleLogout();

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(createApiError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
};

/**
 * Create standardized API error
 */
const createApiError = (error: AxiosError): ApiError => {
  const response = error.response;
  const data = response?.data as any;

  return {
    message: data?.message || error.message || "An unexpected error occurred",
    code: data?.code || error.code,
    status: response?.status,
  };
};

/**
 * Save authentication tokens to cookies with proper security settings
 */
export const saveTokens = (tokens: AuthTokens): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    expires: TOKEN_EXPIRY_DAYS, // 1 year
    secure: isProduction, // HTTPS only in production
    sameSite: "strict" as const, // CSRF protection
    path: "/", // Available site-wide
    domain: isProduction ? ".zamansheikh.com" : undefined, // Set domain for production
  };

  try {
    Cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, cookieOptions);
    Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);

    console.log("[Auth] Tokens saved successfully");
  } catch (error) {
    console.error("[Auth] Failed to save tokens:", error);
    throw new Error("Failed to save authentication tokens");
  }
};

/**
 * Remove authentication tokens from cookies
 */
export const clearTokens = (): void => {
  const cookieOptions = {
    path: "/",
    domain:
      process.env.NODE_ENV === "production" ? ".zamansheikh.com" : undefined,
  };

  try {
    Cookies.remove(ACCESS_TOKEN_COOKIE, cookieOptions);
    Cookies.remove(REFRESH_TOKEN_COOKIE, cookieOptions);

    console.log("[Auth] Tokens cleared successfully");
  } catch (error) {
    console.error("[Auth] Failed to clear tokens:", error);
  }
};

/**
 * Handle logout - clear tokens and redirect
 */
export const handleLogout = (): void => {
  clearTokens();

  // Clear any cached user data
  if (typeof window !== "undefined") {
    // Clear localStorage if you use it
    localStorage.removeItem("user");
    localStorage.removeItem("userPreferences");

    // Optional: Clear sessionStorage
    sessionStorage.clear();
  }

  console.log("[Auth] User logged out");
};

/**
 * Get the current access token
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_COOKIE);
};

/**
 * Get the current refresh token
 */
export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // User is authenticated if they have both tokens
  return !!(accessToken && refreshToken);
};

/**
 * Get user profile from API
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>("/auth/profile");
    return response.data;
  } catch (error) {
    console.error("[Auth] Failed to get user profile:", error);
    throw error;
  }
};

/**
 * Login user with credentials
 */
export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
  try {
    const response = await api.post<{ user: UserProfile; tokens: AuthTokens }>(
      "/auth/login",
      credentials
    );

    // Save tokens
    saveTokens(response.data.tokens);

    return response.data;
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    throw error;
  }
};

/**
 * Register new user
 */
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: UserProfile; tokens: AuthTokens }> => {
  try {
    const response = await api.post<{ user: UserProfile; tokens: AuthTokens }>(
      "/auth/register",
      userData
    );

    // Save tokens
    saveTokens(response.data.tokens);

    return response.data;
  } catch (error) {
    console.error("[Auth] Registration failed:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      // Call logout endpoint to invalidate tokens on server
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("[Auth] Logout API call failed:", error);
    // Continue with local logout even if API call fails
  } finally {
    handleLogout();
  }
};

// Create and export default axios instance
const api = createAxiosInstance();
export default api;

// Export function to create custom instances
export const createApi = createAxiosInstance;

// Export types
export type { AuthTokens, UserProfile, ApiError };
