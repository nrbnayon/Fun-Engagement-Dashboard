"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  requestPasswordReset as apiRequestPasswordReset,
  confirmPasswordReset as apiConfirmPasswordReset,
  isAuthenticated as checkIsAuthenticated,
  clearTokens,
  type UserProfile,
  type LoginCredentials,
  type RegisterData,
  type OtpRequest,
  type OtpVerification,
  type PasswordResetRequest,
  type PasswordResetConfirm,
} from "@/lib/axios";
import { PROTECTED_ROUTES } from "../middleware";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  // Profile methods
  updateProfile: (profileData: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
  // OTP methods
  sendOtp: (data: OtpRequest) => Promise<{ message: string }>;
  verifyOtp: (data: OtpVerification) => Promise<{ message: string }>;
  // Password reset methods
  requestPasswordReset: (
    data: PasswordResetRequest
  ) => Promise<{ message: string }>;
  confirmPasswordReset: (
    data: PasswordResetConfirm
  ) => Promise<{ message: string }>;
  // Utility methods
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// =============================================================================
// AUTH PROVIDER COMPONENT
// =============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const mountedRef = useRef(true);

  // State
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Safe state update that checks if component is still mounted
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Set error message
   */
  const setError = useCallback(
    (error: string) => {
      updateState({ error });
      console.error("[Auth Context]", error);
    },
    [updateState]
  );

  /**
   * Set loading state
   */
  const setLoading = useCallback(
    (isLoading: boolean) => {
      updateState({ isLoading });
    },
    [updateState]
  );

  /**
   * Initialize user session
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      // Check if user has valid tokens
      if (!checkIsAuthenticated()) {
        console.log("[Auth Context] No valid tokens found");
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      console.log("[Auth Context] Tokens found, fetching user profile...");

      // Fetch user profile
      const userProfile = await getUserProfile();

      // 🔥 ADDED: Debug log to see what we're getting
      console.log("[Auth Context] User profile fetched:", userProfile);

      updateState({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log("[Auth Context] User authenticated:", userProfile.email);
    } catch (error: unknown) {
      console.error("[Auth Context] Initialize auth failed:", error);
      // Clear invalid tokens
      clearTokens();
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Only redirect if we're on a protected route
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (PROTECTED_ROUTES.some((route) => currentPath.startsWith(route))) {
          console.log(
            "[Auth Context] Auth failed on protected route, redirecting to login"
          );
          window.location.href = `/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }
      }
    }
  }, [updateState, setLoading, clearError]);

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);
        clearError();

        console.log("[Auth Context] Attempting login for:", credentials.email);

        const response = await apiLogin(credentials);

        console.log("[Auth Context] Login response:", response);

        // Check if response and user exist
        if (!response || !response.user) {
          throw new Error("Invalid response from server. Please try again.");
        }

        const { user } = response;

        console.log("[Auth Context] User logged in successfully:", user);

        updateState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success("Login successful!", {
          description: `Welcome back!`,
          duration: 2000,
        });

        // Get redirect URL from query params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect");

        // Check if redirect URL is a protected route
        if (
          redirectTo &&
          PROTECTED_ROUTES.some((route) => redirectTo.startsWith(route))
        ) {
          router.push(redirectTo);
        } else {
          // Default to overview page
          router.push("/overview");
        }
      } catch (error: unknown) {
        console.error("[Auth Context] Login error:", error);

        // Extract meaningful error message
        let errorMessage = "Login failed. Please try again.";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: unknown }).response === "object" &&
          (error as { response?: unknown }).response !== null
        ) {
          const response = (
            error as {
              response?: { data?: { message?: string; error?: string } };
            }
          ).response;
          if (response && typeof response === "object") {
            const data = (
              response as { data?: { message?: string; error?: string } }
            ).data;
            if (data?.message) {
              errorMessage = data.message;
            } else if (data?.error) {
              errorMessage = data.error;
            } else if (
              "message" in error &&
              typeof (error as { message?: string }).message === "string"
            ) {
              errorMessage =
                (error as { message?: string }).message ?? errorMessage;
            }
          }
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: string }).message === "string"
        ) {
          errorMessage =
            (error as { message?: string }).message ?? errorMessage;
        }

        console.log("[Auth Context] Login error message:", errorMessage);

        toast.error("Login failed", {
          description: errorMessage,
          duration: 4000,
        });

        setError(errorMessage);
        setLoading(false);

        // Re-throw error so form can handle it if needed
        throw new Error(errorMessage);
      }
    },
    [router, updateState, setLoading, clearError, setError]
  );

  /**
   * Register function
   */
  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        setLoading(true);
        clearError();

        console.log(
          "[Auth Context] Attempting registration for:",
          userData.email
        );

        const response = await apiRegister(userData);

        console.log("[Auth Context] Registration response:", response);

        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        console.log(
          "[Auth Context] User registered successfully:",
          response.user.email
        );

        localStorage.setItem("registrationEmail", userData.email);
        localStorage.setItem("otpSentTime", Date.now().toString());

        toast.success("Registration successful!", {
          description:
            "Please check your email and verify your account with the OTP sent.",
          duration: 4000,
        });

        router.push(`/verify-otp?email=${encodeURIComponent(userData.email)}`);
      } catch (error: unknown) {
        console.error("[Auth Context] Registration error:", error);

        let errorMessage = "Registration failed. Please try again.";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: unknown }).response === "object" &&
          (error as { response?: unknown }).response !== null
        ) {
          const response = (
            error as {
              response?: { data?: { message?: string; error?: string } };
            }
          ).response;
          if (response && typeof response === "object") {
            const data = (
              response as { data?: { message?: string; error?: string } }
            ).data;
            if (data?.message) {
              errorMessage = data.message;
            } else if (data?.error) {
              errorMessage = data.error;
            }
          }
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: string }).message === "string"
        ) {
          errorMessage =
            (error as { message?: string }).message ?? errorMessage;
        }

        console.log("[Auth Context] Registration error message:", errorMessage);

        toast.error("Registration failed", {
          description: errorMessage,
          duration: 4000,
        });

        setError(errorMessage);
        setLoading(false);

        throw new Error(errorMessage);
      }
    },
    [router, updateState, setLoading, clearError, setError]
  );

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Call API logout
      await apiLogout();

      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log("[Auth Context] User logged out");

      // Redirect to login page
      router.push("/login");
    } catch (error: unknown) {
      console.error("[Auth Context] Logout error:", error);

      // Force local logout even if API call fails
      clearTokens();

      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      router.push("/login");
    }
  }, [router, updateState, setLoading]);

  // =============================================================================
  // PROFILE METHODS
  // =============================================================================

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profileData: FormData) => {
      try {
        setLoading(true);
        clearError();

        const updatedUser = await apiUpdateProfile(profileData);

        updateState({
          user: updatedUser,
          isLoading: false,
          error: null,
        });

        console.log("[Auth Context] Profile updated successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && error.message
            ? error.message
            : "Profile update failed. Please try again.";

        setError(errorMessage);
        setLoading(false);
        throw error;
      }
    },
    [updateState, setLoading, clearError, setError]
  );

  /**
   * Refresh user profile
   */
  const refreshUser = useCallback(async () => {
    try {
      if (!checkIsAuthenticated()) {
        console.log("[Auth Context] No valid tokens for refresh");
        return;
      }

      console.log("[Auth Context] Refreshing user profile...");
      const userProfile = await getUserProfile();

      updateState({
        user: userProfile,
        error: null,
      });

      console.log("[Auth Context] User profile refreshed successfully");
    } catch (error: unknown) {
      console.error("[Auth Context] Refresh user failed:", error);
      // Don't set error for refresh failures, but clear user if tokens are invalid
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { status?: number } }).response;
        if (response?.status === 401) {
          clearTokens();
          updateState({
            user: null,
            isAuthenticated: false,
          });
        }
      }
    }
  }, [updateState]);

  // =============================================================================
  // OTP METHODS
  // =============================================================================

  /**
   * Send OTP
   */
  const sendOtp = useCallback(
    async (data: OtpRequest): Promise<{ message: string }> => {
      try {
        clearError();

        const result = await apiSendOtp(data);

        console.log("[Auth Context] OTP sent successfully");

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && error.message
            ? error.message
            : "Failed to send OTP. Please try again.";

        setError(errorMessage);
        throw error;
      }
    },
    [clearError, setError]
  );

  /**
   * Verify OTP
   */
  const verifyOtp = useCallback(
    async (data: OtpVerification): Promise<{ message: string }> => {
      try {
        clearError();

        const result = await apiVerifyOtp(data);

        console.log("[Auth Context] OTP verified successfully");

        return result;
      } catch (error: unknown) {
        const errorMessage =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: string }).message === "string"
            ? (error as { message: string }).message
            : "OTP verification failed. Please try again.";

        setError(errorMessage);
        throw error;
      }
    },
    [clearError, setError]
  );

  // =============================================================================
  // PASSWORD RESET METHODS
  // =============================================================================

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(
    async (data: PasswordResetRequest): Promise<{ message: string }> => {
      try {
        setLoading(true);
        clearError();

        const result = await apiRequestPasswordReset(data);

        console.log("[Auth Context] Password reset requested successfully");

        localStorage.setItem("resetEmail", data.email);
        localStorage.setItem("otpSentTime", Date.now().toString());

        toast.success("Reset code sent!", {
          description: "Please check your email for the verification code.",
          duration: 4000,
        });

        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);

        return result && typeof result === "object" && "message" in result
          ? result
          : { message: "Reset code sent!" };
      } catch (error: unknown) {
        console.error("[Auth Context] Forgot password error:", error);

        let errorMessage = "Failed to send reset code. Please try again.";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: unknown }).response === "object" &&
          (error as { response?: unknown }).response !== null
        ) {
          const response = (
            error as {
              response?: { data?: { message?: string; error?: string } };
            }
          ).response;
          if (response && typeof response === "object") {
            const data = (
              response as { data?: { message?: string; error?: string } }
            ).data;
            if (data?.message) {
              errorMessage = data.message;
            } else if (data?.error) {
              errorMessage = data.error;
            }
          }
        }

        toast.error("Failed to send reset code", {
          description: errorMessage,
          duration: 4000,
        });

        setError(errorMessage);
        setLoading(false);

        throw new Error(errorMessage);
      }
    },
    [router, setLoading, clearError, setError]
  );

  /**
   * Confirm password reset
   */
  const confirmPasswordReset = useCallback(
    async (data: PasswordResetConfirm): Promise<{ message: string }> => {
      try {
        clearError();

        const result = await apiConfirmPasswordReset(data);

        console.log("[Auth Context] Password reset confirmed successfully");

        return result;
      } catch (error: unknown) {
        const errorMessage =
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: string }).message === "string"
            ? (error as { message: string }).message
            : "Password reset failed. Please try again.";

        setError(errorMessage);
        throw error;
      }
    },
    [clearError, setError]
  );

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    initializeAuth();

    // Listen for token changes (cross-tab synchronization)
    const handleTokenChange = () => {
      initializeAuth();
    };

    window.addEventListener("auth-token-changed", handleTokenChange);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("auth-token-changed", handleTokenChange);
    };
  }, [initializeAuth]);

  /**
   * Handle route changes for protected routes
   */
  useEffect(() => {
    const handleRouteChange = () => {
      // Refresh user data when navigating to protected routes
      if (state.isAuthenticated && !state.isLoading) {
        refreshUser();
      }
    };

    // Listen for Next.js route changes
    const handlePopState = () => handleRouteChange();

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [state.isAuthenticated, state.isLoading, refreshUser]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: AuthContextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Authentication methods
    login,
    register,
    logout,

    // Profile methods
    updateProfile,
    refreshUser,

    // OTP methods
    sendOtp,
    verifyOtp,

    // Password reset methods
    requestPasswordReset,
    confirmPasswordReset,

    // Utility methods
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

export { AuthContext };

// Export additional utility hooks
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthLoading = () => {
  const { isLoading } = useAuth();
  return isLoading;
};

export const useAuthError = () => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};
