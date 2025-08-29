import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Match } from "../../types/matchType";

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
    const assetsUrl = process.env.NEXT_PUBLIC_ASSETS_API_URL;
    if (assetsUrl) {
      return `${assetsUrl.replace(/\/$/, "")}${imagePath}`;
    }
    console.warn("NEXT_PUBLIC_ASSETS_API_URL is not defined");
    return imagePath;
  }

  // For other paths, ensure they start with /
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};

export let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

(async () => {
  try {
    const res = await fetch("https://ipapi.co/timezone/");
    if (res.ok) {
      const tz = await res.text();
      if (tz) userTimezone = tz;
    }
  } catch (err) {
    console.warn("IP-based timezone fetch failed. Using system timezone.", err);
  }
})();

// ✅ NEW: Helper function to parse date_time and format for display
export const formatDateTimeFromISO = (dateTimeISO: string) => {
  try {
    // Extract date and time parts directly from ISO string without conversion
    const [datePart, timePart] = dateTimeISO.split("T");

    if (!datePart || !timePart) {
      throw new Error("Invalid ISO format");
    }

    // Extract time without timezone conversion
    let timeOnly = timePart;
    if (timePart.includes("+")) {
      timeOnly = timePart.split("+")[0];
    } else if (timePart.includes("-")) {
      const parts = timePart.split("-");
      if (parts.length > 1) {
        timeOnly = parts[0];
      }
    }

    // Parse time components
    const [hours, minutes] = timeOnly.split(":").map(Number);

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    const timeStr = `${displayHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;

    // Parse date components directly from ISO string
    const [year, month, day] = datePart.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day); // month is 0-indexed in Date constructor

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date components");
    }

    // Format date
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);

    return `${formattedDate} - ${timeStr}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return `Invalid Date - ${dateTimeISO}`;
  }
};

// ✅ UPDATED: Format date and time for display with backward compatibility
export const formatDateTime = (match: Match) => {
  // Priority 1: Use date_time if available (new format)
  if (match.date_time) {
    return formatDateTimeFromISO(match.date_time);
  }

  // Priority 2: Fall back to separate date and time fields (old format)
  if (match.date && match.time) {
    try {
      const dateObj = new Date(match.date);
      const [hours, minutes] = match.time.split(":").map(Number);

      // Convert 24-hour to 12-hour format
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const timeStr = `${displayHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;

      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
      };
      const formattedDate = dateObj.toLocaleDateString("en-US", options);
      return `${formattedDate} - ${timeStr}`;
    } catch {
      return `${match.date} - ${match.time}`;
    }
  }

  // Priority 3: Default fallback
  return "Date not available";
};

export const getOriginalTimeOnly = (match: Match) => {
  try {
    // Priority 1: Use date_time if it exists (ISO format)
    if (match.date_time && typeof match.date_time === "string") {
      const timePart = match.date_time.split("T")[1];
      if (timePart) {
        // Handle both + and - timezone indicators
        let timeOnly = timePart;
        if (timePart.includes("+")) {
          timeOnly = timePart.split("+")[0];
        } else if (timePart.includes("-")) {
          const parts = timePart.split("-");
          if (parts.length > 1) {
            timeOnly = parts[0];
          }
        }

        const [hours, minutes] = timeOnly.split(":");
        const hour24 = parseInt(hours, 10);
        const min = parseInt(minutes, 10);

        // Convert to 12-hour format with AM/PM
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? "PM" : "AM";
        const formattedTime = `${hour12}:${min
          .toString()
          .padStart(2, "0")} ${ampm}`;

        return formattedTime;
      }
    }

    // Fallback to existing time field
    if (match.time) {
      const [hours, minutes] = match.time.split(":");
      const hour24 = parseInt(hours, 10);
      const min = parseInt(minutes, 10);

      // Convert to 12-hour format with AM/PM
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? "PM" : "AM";

      return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
    }

    return "--:--";
  } catch (error) {
    console.error("Error getting original time:", error);
    return "--:--";
  }
};

export const getDateOnly = (match: { date_time?: string; date?: string }) => {
  if (match.date_time) {
    const dateObj = new Date(match.date_time);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return dateObj.toLocaleDateString("en-US", options);
  }

  if (match.date) {
    const dateObj = new Date(match.date);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return dateObj.toLocaleDateString("en-US", options);
  }

  return "N/A";
};

export const getTimeOnly = (match: { date_time?: string; time?: string }) => {
  if (match.date_time) {
    const dateObj = new Date(match.date_time);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
  }
  return match.time || "N/A";
};

export const convertDateTimeToUKTime = (
  date: Date | undefined,
  timeStr: string
) => {
  if (!date || !timeStr) return "";

  const [hours, minutes, seconds = "00"] = timeStr.split(":");

  // Format date as YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is 0-indexed
  const day = date.getDate().toString().padStart(2, "0");

  // Format time as HH:MM:SS
  const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(
    2,
    "0"
  )}:${seconds.padStart(2, "0")}`;

  // Determine if the date falls during BST (British Summer Time)
  // BST runs from last Sunday in March to last Sunday in October
  const isBST = isDateInBST(date);
  const offset = isBST ? "+01:00" : "+00:00";

  return `${year}-${month}-${day}T${formattedTime}${offset}`;
};

// Helper function to determine if a date falls during British Summer Time
const isDateInBST = (date: Date): boolean => {
  const year = date.getFullYear();

  // Find last Sunday in March
  const marchLastSunday = getLastSundayOfMonth(year, 2); // March is month 2 (0-indexed)

  // Find last Sunday in October
  const octoberLastSunday = getLastSundayOfMonth(year, 9); // October is month 9 (0-indexed)

  return date >= marchLastSunday && date < octoberLastSunday;
};

// Helper function to get the last Sunday of a given month
const getLastSundayOfMonth = (year: number, month: number): Date => {
  // Start with the last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Find the last Sunday
  const dayOfWeek = lastDay.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;

  return new Date(year, month, lastDay.getDate() - daysToSubtract);
};
