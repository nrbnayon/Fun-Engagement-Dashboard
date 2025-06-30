import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Mail, Shield, Calendar, X } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  userFullName?: string;
  userRole?: string;
  userEmail?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  joinedDate?: string;
  onLogout?: () => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onOpenChange,
  userName = "Robert",
  userFullName = "Johan Robert",
  userRole = "Admin",
  userEmail = "johan.robert@example.com",
  avatarSrc,
  avatarFallback = "JR",
  joinedDate = "January 2024",
  onLogout,
}) => {
  const handleLogout = () => {
    onOpenChange(false);
    onLogout?.();
  };

  // Generate fallback from full name if not provided
  const generateFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayFallback = avatarFallback || generateFallback(userFullName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="bg-primary p-5 flex rounded-t-md flex-row items-center justify-between">
          <DialogTitle className="text-center">Profile Details</DialogTitle>
          <DialogDescription className="sr-only">
            View and manage your profile information including personal details
            and account settings.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary-light rounded-full border-2 border-red-500"
            onClick={() => onOpenChange(false)}
            aria-label="Close profile dialog"
          >
            <X className="h-5 w-5 text-red-500" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 p-6 pt-4">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-border dark:ring-border">
              <AvatarImage
                src={avatarSrc}
                alt={`${userFullName} avatar`}
                className="object-cover"
                onError={(e) => {
                  // Hide broken image and show fallback
                  e.currentTarget.style.display = "none";
                }}
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                {displayFallback}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info Section */}
          <div className="w-full space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {userFullName}
              </h3>
              <p className="text-sm text-muted-foreground">@{userName}</p>
            </div>

            <Separator />

            {/* Profile Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">
                  Full Name:
                </span>
                <span className="font-medium truncate">{userFullName}</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Email:</span>
                <span className="font-medium truncate">{userEmail}</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Role:</span>
                <span className="font-medium capitalize">{userRole}</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Joined:</span>
                <span className="font-medium">{joinedDate}</span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
