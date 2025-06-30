import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get full image URL
export const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/media")) {
    const assetsUrl = process.env.NEXT_ASSETS_API_URL;
    return assetsUrl
      ? `${assetsUrl.replace(/\/$/, "")}${imagePath}`
      : imagePath;
  }
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};
