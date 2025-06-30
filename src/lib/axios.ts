// lib/axios.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import {
  LoginCredentials,
  LoginResponse,
  OtpRequest,
  OtpVerification,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterData,
  UserProfile,
} from "../../types/authTypes";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

// Token expiration: 7 days (more secure than 1 year)
const TOKEN_EXPIRY_DAYS = 7;
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  isVerified?: boolean;
}
interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
}
/**
 * Create a configured axios instance with interceptors for authentication
 */
const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds timeout
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
    reject: (reason?: unknown) => void;
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
          `${API_BASE_URL}/auth/refresh/`,
          { refresh_token: refreshToken },
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
          window.location.href = "/login";
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
  const data = response?.data as Record<string, unknown>;

  return {
    message:
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
        ? data.message
        : error.message || "An unexpected error occurred",
    code:
      typeof data?.code === "string" || typeof data?.code === "number"
        ? data.code
        : error.code,
    status: response?.status,
  };
};

/**
 * Save authentication tokens to cookies with proper security settings
 */
export const saveTokens = (tokens: AuthTokens): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    expires: TOKEN_EXPIRY_DAYS,
    secure: isProduction, // HTTPS only in production
    sameSite: "strict" as const, // CSRF protection
    path: "/", // Available site-wide
  };

  try {
    Cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, cookieOptions);
    Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);

    // Dispatch custom event for cross-tab synchronization
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }

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
  };

  try {
    Cookies.remove(ACCESS_TOKEN_COOKIE, cookieOptions);
    Cookies.remove(REFRESH_TOKEN_COOKIE, cookieOptions);

    // Dispatch custom event for cross-tab synchronization
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }

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
    localStorage.removeItem("user");
    localStorage.removeItem("userPreferences");
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

// =============================================================================
// AUTH API FUNCTIONS
// =============================================================================

/**
 * Get user profile from API
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiEndpoint.get<UserProfile>("/auth/profile/");
    return response.data;
  } catch (error) {
    console.error("[Auth] Failed to get user profile:", error);
    throw error;
  }
};

/**
 * Login user with credentials
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{
  user: UserProfile;
  tokens: AuthTokens;
  isValidated?: boolean;
}> => {
  try {
    console.log("[API] Attempting login for:", credentials.email);

    const response = await apiEndpoint.post<LoginResponse>(
      "/auth/login/",
      credentials
    );

    console.log("[API] Login response received:", {
      status: response.status,
      hasProfile: !!response.data?.profile,
      hasTokens: !!(
        response.data?.access_token && response.data?.refresh_token
      ),
    });

    // Validate response structure
    if (!response.data) {
      throw new Error("No data received from server");
    }

    if (!response.data.access_token || !response.data.refresh_token) {
      throw new Error("Authentication tokens not received");
    }

    if (!response.data.profile) {
      throw new Error("User profile not received");
    }

    const tokens: AuthTokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      isVerified: response.data.is_verified || false,
    };

    // Save tokens
    saveTokens(tokens);

    console.log("[API] Login successful for user:", response.data.profile);

    return {
      user: response.data.profile, // Use 'profile' from response
      tokens,
      isValidated: response.data.is_verified || false,
    };
  } catch (error: unknown) {
    console.error("[API] Login failed:", error);

    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          throw new Error(
            data?.message || data?.error || "Invalid credentials"
          );
        } else if (status === 401) {
          throw new Error("Invalid email or password");
        } else if (status === 429) {
          throw new Error("Too many login attempts. Please try again later.");
        } else if (status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(data?.message || data?.error || "Login failed");
        }
      } else if (error.request) {
        // Network error
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      } else if (error.message) {
        // Our custom error message
        throw error;
      } else {
        // Unknown error
        throw new Error("An unexpected error occurred. Please try again.");
      }
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
};

/**
 * Register new user in axios file
 */
export const register = async (
  userData: RegisterData
): Promise<{
  message: string;
  user: UserProfile;
}> => {
  try {
    const response = await apiEndpoint.post<{
      message: string;
      user: UserProfile;
    }>("/auth/register/", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    });
    return {
      message: response.data.message,
      user: response.data.user,
    };
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
      await apiEndpoint.post("/auth/logout/", { refresh_token: refreshToken });
    }
  } catch (error) {
    console.error("[Auth] Logout API call failed:", error);
  } finally {
    handleLogout();
  }
};

/**
 * Update user profile with FormData
 */
export const updateProfile = async (
  profileData: FormData
): Promise<UserProfile> => {
  try {
    const response = await apiEndpoint.put<UserProfile>(
      "/auth/profile/",
      profileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[Auth] Profile update failed:", error);
    throw error;
  }
};

// =============================================================================
// OTP API FUNCTIONS
// =============================================================================

/**
 * Send OTP to email
 */
export const sendOtp = async (
  data: OtpRequest
): Promise<{ message: string }> => {
  try {
    const response = await apiEndpoint.post<{ message: string }>(
      "/auth/otp/create/",
      data
    );
    return response.data;
  } catch (error) {
    console.error("[Auth] Send OTP failed:", error);
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (
  data: OtpVerification
): Promise<{ message: string }> => {
  try {
    const response = await apiEndpoint.post<{ message: string }>(
      "/auth/otp/verify/",
      data
    );
    return response.data;
  } catch (error) {
    console.error("[Auth] Verify OTP failed:", error);
    throw error;
  }
};

// =============================================================================
// PASSWORD RESET API FUNCTIONS
// =============================================================================

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<{ message: string }> => {
  try {
    const response = await apiEndpoint.post<{ message: string }>(
      "/auth/password-reset/request/",
      data
    );
    return response.data;
  } catch (error) {
    console.error("[Auth] Password reset request failed:", error);
    throw error;
  }
};

/**
 * Confirm password reset with OTP
 */
export const confirmPasswordReset = async (
  data: PasswordResetConfirm
): Promise<{ message: string }> => {
  try {
    const response = await apiEndpoint.post<{ message: string }>(
      "/auth/password-reset/confirm/",
      data
    );
    return response.data;
  } catch (error) {
    console.error("[Auth] Password reset confirmation failed:", error);
    throw error;
  }
};

const apiEndpoint = createAxiosInstance();
export default apiEndpoint;

// Export function to create custom instances
export const createApi = createAxiosInstance;

// Export types
export type {
  AuthTokens,
  UserProfile,
  // UserProfileData,
  ApiError,
  LoginCredentials,
  RegisterData,
  OtpRequest,
  OtpVerification,
  PasswordResetRequest,
  PasswordResetConfirm,
};

// Helper functions for safe access to nested profile data
export const getProfileName = (profile: UserProfile): string => {
  return profile.user_profile?.name || profile.email?.split("@")[0] || "User";
};

export const getProfilePicture = (profile: UserProfile): string => {
  return profile.user_profile?.profile_picture || "/default-avatar.png";
};

export const getPhoneNumber = (profile: UserProfile): string => {
  return profile.user_profile?.phone_number || "";
};

export const getJoinedDate = (profile: UserProfile): string => {
  return profile.user_profile?.joined_date || "";
};

export const isProfileVerified = (profile: UserProfile): boolean => {
  return profile.is_verified || false;
};
