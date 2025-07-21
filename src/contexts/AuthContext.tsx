"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
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
  hasValidTokens,
  clearTokens,
  type UserProfile,
  type LoginCredentials,
  type RegisterData,
  type OtpRequest,
  type OtpVerification,
  type PasswordResetRequest,
  type PasswordResetConfirm,
} from "@/lib/axios";
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
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
  sendOtp: (data: OtpRequest) => Promise<{ message: string }>;
  verifyOtp: (data: OtpVerification) => Promise<{ message: string }>;
  requestPasswordReset: (
    data: PasswordResetRequest
  ) => Promise<{ message: string }>;
  confirmPasswordReset: (
    data: PasswordResetConfirm
  ) => Promise<{ message: string }>;
  clearError: () => void;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const setError = useCallback(
    (error: string) => {
      updateState({ error });
    },
    [updateState]
  );

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        updateState({ isLoading: true, error: null });

        const { user, requiresAdminApproval } = await apiLogin(credentials);

        if (requiresAdminApproval) {
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.info("Account Pending Approval", {
            description:
              "Your admin account is pending approval. Please wait for verification.",
          });

          router.push("/pending-approval");
          return;
        }

        updateState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast.success("Login successful!");

        // Handle redirect
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get("redirect");
        router.push(redirectTo || "/overview");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.";
        setError(errorMessage);
        updateState({ isLoading: false });
        toast.error("Login failed", { description: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [router, updateState, setError]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      try {
        updateState({ isLoading: true, error: null });

        await apiRegister(userData);

        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        localStorage.setItem("registrationEmail", userData.email);
        localStorage.setItem("otpSentTime", Date.now().toString());

        toast.success("Registration successful!", {
          description:
            "Please check your email and verify your account with the OTP sent.",
        });

        router.push(`/verify-otp?email=${encodeURIComponent(userData.email)}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.";
        setError(errorMessage);
        updateState({ isLoading: false });
        toast.error("Registration failed", { description: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [router, updateState, setError]
  );

  const logout = useCallback(async () => {
    try {
      updateState({ isLoading: true });
      await apiLogout();
    } catch (error: unknown) {
      console.error("Logout error:", error);
    } finally {
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push("/login");
    }
  }, [router, updateState]);

  // =============================================================================
  // OTHER METHODS
  // =============================================================================

  const updateProfile = useCallback(
    async (profileData: FormData) => {
      try {
        updateState({ isLoading: true, error: null });
        const updatedUser = await apiUpdateProfile(profileData);
        updateState({ user: updatedUser, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Profile update failed.";
        setError(errorMessage);
        updateState({ isLoading: false });
        throw new Error(errorMessage);
      }
    },
    [updateState, setError]
  );

  const refreshUser = useCallback(async () => {
    try {
      if (!hasValidTokens()) return;

      const userProfile = await getUserProfile();
      updateState({ user: userProfile, error: null });
    } catch (error: unknown) {
      if (error instanceof Error && "status" in error && error.status === 401) {
        // clearTokens();
        updateState({
          user: null,
          isAuthenticated: false,
        });
      }
    }
  }, [updateState]);

  const sendOtp = useCallback(
    async (data: OtpRequest): Promise<{ message: string }> => {
      try {
        clearError();
        return await apiSendOtp(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send OTP.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [clearError, setError]
  );

  const verifyOtp = useCallback(
    async (data: OtpVerification): Promise<{ message: string }> => {
      try {
        clearError();
        return await apiVerifyOtp(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "OTP verification failed.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [clearError, setError]
  );

  const requestPasswordReset = useCallback(
    async (data: PasswordResetRequest): Promise<{ message: string }> => {
      try {
        updateState({ isLoading: true, error: null });

        const result = await apiRequestPasswordReset(data);

        localStorage.setItem("resetEmail", data.email);
        localStorage.setItem("otpSentTime", Date.now().toString());

        toast.success("Reset code sent!", {
          description: "Please check your email for the verification code.",
        });

        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send reset code.";
        setError(errorMessage);
        updateState({ isLoading: false });
        toast.error("Failed to send reset code", { description: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [router, updateState, setError]
  );

  const confirmPasswordReset = useCallback(
    async (data: PasswordResetConfirm): Promise<{ message: string }> => {
      try {
        clearError();
        return await apiConfirmPasswordReset(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Password reset failed.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [clearError, setError]
  );

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  const initializeAuth = useCallback(async () => {
    try {
      if (!hasValidTokens()) {
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const userProfile = await getUserProfile();

      // console.log("Get login user profile::", userProfile);

      // Check admin approval requirement
      if (userProfile.role === "admin" && !userProfile.is_verified) {
        clearTokens();
        updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      updateState({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearTokens();
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [updateState]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    initializeAuth();

    const handleTokenChange = () => {
      initializeAuth();
    };

    window.addEventListener("auth-token-changed", handleTokenChange);
    return () => {
      window.removeEventListener("auth-token-changed", handleTokenChange);
    };
  }, [initializeAuth]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    sendOtp,
    verifyOtp,
    requestPasswordReset,
    confirmPasswordReset,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
