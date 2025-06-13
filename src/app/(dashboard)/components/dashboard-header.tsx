import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ChevronDownIcon } from "lucide-react";
import { IoNotifications } from "react-icons/io5";

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
  avatarFallback = "JR",
}) => {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning,";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon,";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening,";
    } else {
      return "Good Night,";
    }
  };

  return (
    <header className='sticky top-0 z-50 flex w-full items-center justify-between px-6 py-4 bg-primary-light dark:bg-surface transition-colors duration-200'>
      {/* Greeting Section */}
      <div className='flex flex-col items-start gap-0.5'>
        <h1 className='font-h5-regular text-secondary dark:text-primary transition-colors duration-200'>
          {getTimeGreeting()}
        </h1>
        <p className='font-oswald-medium text-text-secondary dark:text-text-primary transition-colors duration-200'>
          {userName}
        </p>
      </div>

      {/* User Actions Section */}
      <div className='flex items-center gap-4'>
        {/* Theme Toggle */}
        <ModeToggle />

        {/* Notifications Button */}
        <Button
          variant='outline'
          size='icon'
          className='relative h-12 w-12 rounded-full bg-surface dark:bg-surface-elevated border-border dark:border-border hover:bg-surface-hover dark:hover:bg-surface-hover transition-all duration-200 shadow-sm hover:shadow-md'
        >
          <IoNotifications className='h-5 w-5 text-text-secondary dark:text-text-secondary' />
          <span className='sr-only'>Notifications</span>

          {/* Optional notification badge */}
          <span className='absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full border-2 border-surface dark:border-surface-elevated'></span>
        </Button>

        {/* User Profile Section */}
        <div className='flex items-center gap-3 group cursor-pointer hover:bg-background-secondary/50 dark:hover:bg-surface-hover/30 rounded-lg px-2 py-1 transition-all duration-200'>
          {/* Avatar */}
          <Avatar className='h-12 w-12 ring-2 ring-border dark:ring-border group-hover:ring-border-primary dark:group-hover:ring-primary transition-all duration-200'>
            <AvatarImage
              src={avatarSrc}
              alt={`${userFullName} avatar`}
              className='object-cover'
            />
            <AvatarFallback className='bg-primary text-primary-foreground font-h6-medium'>
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className='flex flex-col items-start min-w-[101px]'>
            {/* Full Name */}
            <span className='font-h6-medium text-secondary dark:text-primary transition-colors duration-200 group-hover:text-interactive dark:group-hover:text-primary-light'>
              {userFullName}
            </span>

            {/* Role with Dropdown */}
            <div className='flex items-center gap-1.5'>
              <span className='font-regular-lg-regular text-text-muted dark:text-text-muted text-sm transition-colors duration-200'>
                {userRole}
              </span>
              <ChevronDownIcon className='h-3 w-3 text-text-muted dark:text-text-muted group-hover:text-interactive dark:group-hover:text-primary transition-all duration-200 group-hover:translate-y-0.5' />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
