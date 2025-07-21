import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import type {
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

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
}

/**
 * Create a configured axios instance
 */
const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
    ...config,
  });

  // Request interceptor - Add auth token to headers
  instance.interceptors.request.use(
    (config) => {
      const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);
      if (accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Handle multipart/form-data
      if (config.data instanceof FormData) {
        if (
          config.headers &&
          config.headers["Content-Type"] === "multipart/form-data"
        ) {
          delete config.headers["Content-Type"];
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle errors (simplified)
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // If 401, clear tokens and redirect to login
      if (error.response?.status === 401) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      return Promise.reject(createApiError(error));
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
 * Save authentication tokens (simplified - let backend handle expiration)
 */
export const saveTokens = (tokens: AuthTokens): void => {
  try {
    // Simple cookie storage - backend handles expiration and security
    Cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { path: "/" });
    Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { path: "/" });

    // Dispatch event for cross-tab sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }
  } catch (error) {
    console.error("Failed to save tokens:", error);
    throw new Error("Failed to save authentication tokens");
  }
};

/**
 * Clear authentication tokens
 */
export const clearTokens = (): void => {
  try {
    Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });

    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("userPreferences");
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent("auth-token-changed"));
    }
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};

/**
 * Get the current access token
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_COOKIE);
};

/**
 * Check if user has valid tokens
 */
export const hasValidTokens = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
  return !!(accessToken && refreshToken);
};

// =============================================================================
// AUTH API FUNCTIONS
// =============================================================================

/**
 * Get user profile from API
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiEndpoint.get<UserProfile>("/auth/profile/");
  return response.data;
};

/**
 * Login user with credentials
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{
  user: UserProfile;
  tokens: AuthTokens;
  requiresAdminApproval?: boolean;
}> => {
  const response = await apiEndpoint.post<LoginResponse>(
    "/auth/login/",
    credentials
  );

  if (
    !response.data?.access_token ||
    !response.data?.refresh_token ||
    !response.data?.profile
  ) {
    throw new Error("Invalid response from server");
  }

  const tokens: AuthTokens = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
  };

  const userProfile = response.data.profile;
  const requiresAdminApproval =
    userProfile.role === "admin" && !userProfile.is_verified;

  // Only save tokens if user doesn't require admin approval
  if (!requiresAdminApproval) {
    saveTokens(tokens);
  }

  return {
    user: userProfile,
    tokens,
    requiresAdminApproval,
  };
};

/**
 * Register new user
 */
export const register = async (
  userData: RegisterData
): Promise<{
  message: string;
  user: UserProfile;
}> => {
  const response = await apiEndpoint.post<{
    message: string;
    user: UserProfile;
  }>("/auth/register/", {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || "user",
  });

  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
      await apiEndpoint.post("/auth/logout/", { refresh_token: refreshToken });
    }
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    clearTokens();
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  profileData: FormData
): Promise<UserProfile> => {
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
};

// =============================================================================
// OTP API FUNCTIONS
// =============================================================================

export const sendOtp = async (
  data: OtpRequest
): Promise<{ message: string }> => {
  const response = await apiEndpoint.post<{ message: string }>(
    "/auth/otp/create/",
    data
  );
  return response.data;
};

export const verifyOtp = async (
  data: OtpVerification
): Promise<{ message: string }> => {
  const response = await apiEndpoint.post<{ message: string }>(
    "/auth/otp/verify/",
    data
  );
  return response.data;
};

// =============================================================================
// PASSWORD RESET API FUNCTIONS
// =============================================================================

export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<{ message: string }> => {
  const response = await apiEndpoint.post<{ message: string }>(
    "/auth/password-reset/request/",
    data
  );
  return response.data;
};

export const confirmPasswordReset = async (
  data: PasswordResetConfirm
): Promise<{ message: string }> => {
  const response = await apiEndpoint.post<{ message: string }>(
    "/auth/password-reset/confirm/",
    data
  );
  return response.data;
};

const apiEndpoint = createAxiosInstance();
export default apiEndpoint;

// Helper functions
export const getProfileName = (profile: UserProfile): string => {
  return profile.user_profile?.name || profile.email?.split("@")[0] || "User";
};

export const getProfilePicture = (profile: UserProfile): string => {
  return profile.user_profile?.profile_picture || "/default-avatar.png";
};

export const isProfileVerified = (profile: UserProfile): boolean => {
  return profile.is_verified || false;
};

export type {
  AuthTokens,
  UserProfile,
  ApiError,
  LoginCredentials,
  RegisterData,
  OtpRequest,
  OtpVerification,
  PasswordResetRequest,
  PasswordResetConfirm,
};
