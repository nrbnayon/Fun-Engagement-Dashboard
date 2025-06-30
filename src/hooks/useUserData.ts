// hooks/useUserData.ts
import { useAuth } from "@/contexts/AuthContext";
import { getProfileName, getProfilePicture, getPhoneNumber } from "@/lib/axios";

/**
 * Hook to get formatted user data with fallbacks
 */
export const useUserData = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (!user) {
    return {
      user: null,
      isLoading,
      isAuthenticated,
      userName: null,
      userFullName: null,
      userEmail: null,
      userRole: null,
      avatarSrc: null,
      phoneNumber: null,
      joinedDate: null,
      isVerified: false,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userName: getProfileName(user),
    userFullName: user.user_profile?.name || getProfileName(user),
    userEmail: user.email,
    userRole: user.role || "User",
    avatarSrc: getProfilePicture(user),
    phoneNumber: getPhoneNumber(user),
    joinedDate: user.user_profile?.joined_date,
    isVerified: user.is_verified || false,
  };
};

/**
 * Hook to get user permissions/role checks
 */
export const useUserPermissions = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === "admin",
    isModerator: user?.role === "moderator",
    isUser: user?.role === "user",
    isVerified: user?.is_verified || false,
    canAccess: (requiredRole: string) => {
      if (!user) return false;

      const roleHierarchy = {
        admin: 3,
        moderator: 2,
        user: 1,
      };

      const userLevel =
        roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
      const requiredLevel =
        roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

      return userLevel >= requiredLevel;
    },
  };
};

/**
 * Hook to check if user data is ready
 */
export const useUserReady = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    isReady: !isLoading && isAuthenticated && !!user,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
  };
};

/**
 * Hook for user profile actions
 */
export const useUserActions = () => {
  const { logout, updateProfile, refreshUser } = useAuth();

  return {
    logout,
    updateProfile,
    refreshUser,
  };
};
