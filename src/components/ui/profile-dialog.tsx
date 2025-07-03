import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Mail,
  Shield,
  Calendar,
  X,
  Edit3,
  Save,
  XCircle,
  Camera,
  Phone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
}) => {
  const { logout, updateProfile, user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: userFullName,
    phone_number: user?.user_profile?.phone_number || "",
  });

  // Reset form when dialog opens/closes or user data changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: userFullName,
        phone_number: user?.user_profile?.phone_number || "",
      });
      setPreviewImage(null);
      setIsEditing(false);
    }
  }, [open, userFullName, user]);

  const handleLogout = async () => {
    try {
      await logout();
      onOpenChange(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpdate = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setIsUpdating(true);
      const formDataToSend = new FormData();
      formDataToSend.append("profile_picture", file);

      await updateProfile(formDataToSend);
      await refreshUser();

      toast.success("Profile picture updated successfully!");
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const formDataToSend = new FormData();

      // Only append fields that have changed
      if (formData.name !== userFullName) {
        formDataToSend.append("name", formData.name);
      }

      if (formData.phone_number !== (user?.user_profile?.phone_number || "")) {
        formDataToSend.append("phone_number", formData.phone_number);
      }

      // Check if there's anything to update
      if (formDataToSend.entries().next().done) {
        toast.info("No changes to save");
        setIsEditing(false);
        return;
      }

      await updateProfile(formDataToSend);
      await refreshUser();

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userFullName,
      phone_number: user?.user_profile?.phone_number || "",
    });
    setIsEditing(false);
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
  const currentAvatarSrc = previewImage || avatarSrc;

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
                src={currentAvatarSrc}
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

            {/* Camera overlay button */}
            <div className="absolute -bottom-2 -right-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-background border-2 border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Image update controls */}
          {previewImage && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={handleImageUpdate}
                disabled={isUpdating}
                className="flex-1"
                size="sm"
              >
                {isUpdating ? "Updating..." : "Update Picture"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isUpdating}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* User Info Section */}
          <div className="w-full space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {isEditing ? formData.name : userFullName}
              </h3>
              <p className="text-sm text-muted-foreground">@{userName}</p>
            </div>

            <Separator />

            {/* Profile Details */}
            <div className="space-y-3">
              {/* Full Name */}
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">
                  Full Name:
                </span>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span className="font-medium truncate">{userFullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Email:</span>
                <span className="font-medium truncate">{userEmail}</span>
              </div>

              {/* Phone Number */}
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Phone:</span>
                {isEditing ? (
                  <Input
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className="flex-1 h-8 text-sm"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <span className="font-medium truncate">
                    {user?.user_profile?.phone_number || "Not provided"}
                  </span>
                )}
              </div>

              {/* Role */}
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Role:</span>
                <span className="font-medium capitalize">{userRole}</span>
              </div>

              {/* Joined Date */}
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0">Joined:</span>
                <span className="font-medium">{joinedDate}</span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={handleLogout}
                disabled={isUpdating}
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
