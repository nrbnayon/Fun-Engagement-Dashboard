// src/components/dashboard-header.tsx
"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChevronDownIcon } from "lucide-react";
import { IoNotifications } from "react-icons/io5";
import { ProfileDialog } from "@/components/ui/profile-dialog";

interface DashboardHeaderProps {
  userName?: string;
  userFullName?: string;
  userRole?: string;
  avatarSrc?: string;
  avatarFallback?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = "Robert",
  userFullName = "Johan Robert",
  userRole = "Admin",
  avatarSrc = "/avator.png",
  avatarFallback = "N",
}) => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon,";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Hello";
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logout clicked from header");
    // For example: redirect to login page, clear tokens, etc.
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  return (
    <>
      <header className='sticky top-0 z-40 flex w-full items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-primary-light dark:bg-surface transition-colors duration-200'>
        {/* Greeting Section */}
        <div
          className='flex flex-col items-start gap-0.5 cursor-pointer flex-shrink min-w-0'
          onClick={handleProfileClick}
        >
          <h1 className='font-h6-medium text-blue-100 dark:text-foreground transition-colors duration-200 text-md sm:text-xl'>
            {getTimeGreeting()}
          </h1>
          <p className='font-oswald-medium dark:text-text-primary transition-colors duration-200 hover:text-interactive dark:hover:text-primary-light text-sm sm:text-base truncate'>
            {userName}
          </p>
        </div>

        {/* User Actions Section */}
        <div className='flex items-center gap-2 sm:gap-4 flex-shrink-0'>
          {/* Theme Toggle - Hidden on very small screens */}
          <div className='hidden xs:block'>
            <ModeToggle />
          </div>

          {/* Notifications Button */}
          <Button
            variant='outline'
            size='icon'
            className='relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-transparent hover:bg-gray-300 dark:bg-transparent border-border dark:border-border transition-all duration-200 shadow-sm hover:shadow-md'
          >
            <IoNotifications className='h-4 w-4 sm:h-5 sm:w-5 text-text-secondary dark:text-text-secondary dark:hover:text-black' />
            <span className='sr-only'>Notifications</span>
          </Button>

          {/* User Profile Section */}
          <div
            className='flex items-center gap-2 sm:gap-3 group cursor-pointer hover:bg-background-secondary/50 dark:hover:bg-surface-hover/30 rounded-lg px-1 sm:px-2 py-1 transition-all duration-200'
            onClick={handleProfileClick}
          >
            {/* Avatar */}
            <Avatar className='h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-border dark:ring-border group-hover:ring-border-primary dark:group-hover:ring-primary transition-all duration-200 flex-shrink-0'>
              <AvatarImage
                src={avatarSrc}
                alt={`${userFullName} avatar`}
                className='object-cover'
              />
              <AvatarFallback className='bg-primary text-primary-foreground font-h6-medium text-xs sm:text-sm'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>

            {/* User Info - Hidden on small screens, shown on medium and up */}
            <div className='hidden sm:flex flex-col items-start min-w-0 flex-shrink'>
              {/* Full Name */}
              <span className='font-h6-medium text-secondary dark:text-foreground transition-colors duration-200 group-hover:text-interactive dark:group-hover:text-primary-light truncate max-w-24 lg:max-w-32'>
                {userFullName}
              </span>

              {/* Role with Dropdown */}
              <div className='flex items-center gap-1.5 min-w-0'>
                <span className='font-regular-lg-regular text-text-muted dark:text-text-muted text-sm transition-colors duration-200 truncate'>
                  {userRole}
                </span>
                <ChevronDownIcon className='h-3 w-3 text-text-muted dark:text-text-muted group-hover:text-interactive dark:group-hover:text-primary transition-all duration-200 group-hover:translate-y-0.5 flex-shrink-0' />
              </div>
            </div>

            {/* Mobile dropdown indicator - Only shown on small screens */}
            <ChevronDownIcon className='h-3 w-3 sm:hidden text-text-muted dark:text-text-muted group-hover:text-interactive dark:group-hover:text-primary transition-all duration-200 group-hover:translate-y-0.5 flex-shrink-0' />
          </div>

          {/* Theme Toggle for very small screens - shown as part of profile area */}
          <div className='block xs:hidden'>
            <ModeToggle />
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
        userEmail='johan.robert@dumbarton.com'
        avatarSrc={avatarSrc}
        avatarFallback={avatarFallback}
        joinedDate='January 2024'
        onLogout={handleLogout}
      />
    </>
  );
};
