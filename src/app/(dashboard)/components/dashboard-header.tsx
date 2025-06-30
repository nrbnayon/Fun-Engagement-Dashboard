"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { IoNotifications } from "react-icons/io5";
import { ProfileDialog } from "@/components/ui/profile-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileName } from "@/lib/axios";
import { getFullImageUrl } from "@/lib/utils";

interface DashboardHeaderProps {
  userName?: string;
  userFullName?: string;
  userRole?: string;
  avatarSrc?: string;
  avatarFallback?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName: defaultUserName = "User",
  userRole: defaultUserRole = "User",
  avatarSrc: defaultAvatarSrc = "/avatar.png",
  avatarFallback: defaultAvatarFallback = "U",
}) => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { user, isLoading, refreshUser } = useAuth();

  // Refresh user data when component mounts
  useEffect(() => {
    if (!user && !isLoading) {
      refreshUser();
    }
  }, [user, isLoading, refreshUser]);

  // Extract user data with fallbacks
  const userName = user ? getProfileName(user) : defaultUserName;
  const userFullName = user?.user_profile?.name || userName;
  const userRole = user?.role || defaultUserRole;
  const userEmail = user?.email || "";


  // Handle profile picture URL
  const profilePictureUrl = user?.user_profile?.profile_picture
    ? getFullImageUrl(user.user_profile.profile_picture)
    : defaultAvatarSrc;

  console.log("User::", profilePictureUrl);

  // Generate avatar fallback from name
  const avatarFallback =
    userFullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || defaultAvatarFallback;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Hello";
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked from header");
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 flex w-full items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-primary-light dark:bg-surface transition-colors duration-200">
        <div className="flex flex-col items-start gap-0.5">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-primary-light dark:bg-surface transition-colors duration-200">
        {/* Greeting Section */}
        <div
          className="flex flex-col items-start gap-0.5 cursor-pointer flex-shrink min-w-0"
          onClick={handleProfileClick}
        >
          <h1 className="font-h6-medium text-blue-100 dark:text-foreground transition-colors duration-200 text-md sm:text-xl">
            {getTimeGreeting()}
          </h1>
          <p className="font-oswald-medium dark:text-text-primary transition-colors duration-200 hover:text-interactive dark:hover:text-primary-light text-sm sm:text-base truncate">
            {userName}
          </p>
        </div>

        {/* User Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications Button */}
          <Button
            variant="outline"
            size="icon"
            className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-transparent hover:bg-gray-300 dark:bg-transparent border-border dark:border-border transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <IoNotifications className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary dark:text-text-secondary dark:hover:text-black" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Profile Section */}
          <div
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover:bg-background-secondary/50 dark:hover:bg-surface-hover/30 rounded-lg px-1 sm:px-2 py-1 transition-all duration-200"
            onClick={handleProfileClick}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-border dark:ring-border group-hover:ring-border-primary dark:group-hover:ring-primary transition-all duration-200 flex-shrink-0">
              <AvatarImage
                src={profilePictureUrl || "/placeholder.svg"}
                alt={`${userFullName} avatar`}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-h6-medium text-xs sm:text-sm">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>

            {/* User Info - Hidden on small screens, shown on medium and up */}
            <div className="hidden sm:flex flex-col items-start min-w-0 flex-shrink">
              {/* Full Name */}
              <span className="font-h6-medium text-secondary dark:text-foreground transition-colors duration-200 group-hover:text-interactive dark:group-hover:text-primary-light truncate max-w-24 lg:max-w-32">
                {userFullName}
              </span>

              {/* Role with Dropdown */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-regular-lg-regular text-text-muted dark:text-text-muted text-sm transition-colors duration-200 truncate capitalize">
                  {userRole}
                </span>
                <ChevronDownIcon className="h-3 w-3 text-text-muted dark:text-text-muted group-hover:text-interactive dark:group-hover:text-primary transition-all duration-200 group-hover:translate-y-0.5 flex-shrink-0" />
              </div>
            </div>

            {/* Mobile dropdown indicator - Only shown on small screens */}
            <ChevronDownIcon className="h-3 w-3 sm:hidden text-text-muted dark:text-text-muted group-hover:text-interactive dark:group-hover:text-primary transition-all duration-200 group-hover:translate-y-0.5 flex-shrink-0" />
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        userName={userName}
        userFullName={userFullName}
        userRole={userRole}
        userEmail={userEmail}
        avatarSrc={profilePictureUrl ?? undefined}
        avatarFallback={avatarFallback}
        joinedDate={
          user?.user_profile?.joined_date
            ? new Date(user.user_profile.joined_date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                }
              )
            : "Recently"
        }
        onLogout={handleLogout}
      />
    </>
  );
};
