// src/lib/services/playlistDataApi.ts
import apiEndpoint from "@/lib/axios";
import { AxiosError } from "axios";
const PLAYER_ENDPOINTS = {
  GET_ALL_PLAYERS: "/players/",
  CREATE_PLAYER: "/players/",
  GET_PLAYER_BY_ID: "/players/",
  UPDATE_PLAYER: "/players/",
  DELETE_PLAYER: "/players/",
};

// Interface definitions
interface Player {
  id: number;
  name: string;
  jersey_number: number;
  image: string | null;
  status: string;
}

interface CreatePlayerData {
  name: string;
  jersey_number: number;
  image?: File | null;
  status: string;
}

interface UpdatePlayerData {
  name?: string;
  jersey_number?: number;
  image?: File | null;
  status?: string;
}

/**
 * Helper function to create FormData for multipart/form-data requests
 */
const createPlayerFormData = (
  data: CreatePlayerData | UpdatePlayerData
): FormData => {
  const formData = new FormData();

  // ✅ ADD: Enhanced logging
  console.log("[Player API] Input data for FormData:", data);

  // Add all non-file fields with proper validation
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "image" && value !== undefined && value !== null) {
      // Convert numbers to strings for FormData
      if (typeof value === "number") {
        console.log(`[Player API] Adding number field: ${key} = ${value}`);
        formData.append(key, value.toString());
      } else {
        console.log(
          `[Player API] Adding string field: ${key} = ${String(value)}`
        );
        formData.append(key, String(value));
      }
    }
  });

  // Handle image file separately with validation
  if (data.image && data.image instanceof File) {
    // Validate file type (optional but recommended)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(data.image.type)) {
      console.log(
        `[Player API] Adding image file: ${data.image.name} (${data.image.size} bytes, ${data.image.type})`
      );
      formData.append("image", data.image, data.image.name);
    } else {
      throw new Error(
        `Invalid file type: ${
          data.image.type
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
    }
  } else if (data.image === null) {
    console.log("[Player API] No image provided (null)");
  }

  // Debug: Log FormData contents (always log for debugging this issue)
  console.log("[Player API] Final FormData contents:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
      );
    } else {
      console.log(`${key}: "${value}"`);
    }
  }

  return formData;
};

/**
 * Get all players with better error handling
 */
export const getAllPlayers = async () => {
  try {
    // console.log("[Player API] Fetching all players...");

    const response = await apiEndpoint.get(PLAYER_ENDPOINTS.GET_ALL_PLAYERS);

    // console.log("[Player API] Success:", {
    //   status: response.status,
    //   dataLength: Array.isArray(response.data)
    //     ? response.data.length
    //     : "not array",
    // });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Player API] Error getting all players:", error);

    // More detailed error logging
    if (error && typeof error === "object" && "message" in error) {
      console.error("[Player API] Error details:", {
        message: error.message,
        status: "status" in error ? error.status : "unknown",
      });
    }

    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Unknown error occurred",
    };
  }
};

/**
 * Create a new player - Fixed version with proper multipart/form-data handling
 */
export const createPlayer = async (playerData: CreatePlayerData) => {
  try {
    console.log("[Player API] Creating player:", {
      name: playerData.name,
      jersey_number: playerData.jersey_number,
      status: playerData.status,
      hasImage: !!playerData.image,
      imageType: playerData.image?.type,
      imageSize: playerData.image?.size,
    });

    const formData = createPlayerFormData(playerData);

    // Create the request with explicit multipart/form-data headers
    const response = await apiEndpoint.post(
      PLAYER_ENDPOINTS.CREATE_PLAYER,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("[Player API] Player created successfully:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Player API] Error creating player:", error);

    // Enhanced error handling for file uploads
    if (error && typeof error === "object") {
      if ("response" in error) {
        const axiosError = error as AxiosError;

        // ✅ ADD: Log the full error response for debugging
        console.error("[Player API] Full error response:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
        });

        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as any;

          // ✅ ADD: More detailed 400 error handling
          console.log("[Player API] 400 Error Details:", errorData);

          // Handle specific field errors
          if (
            errorData?.jersey_number &&
            Array.isArray(errorData.jersey_number)
          ) {
            return {
              success: false,
              error:
                "Jersey number error: " + errorData.jersey_number.join(", "),
            };
          }

          if (errorData?.status && Array.isArray(errorData.status)) {
            return {
              success: false,
              error: "Status error: " + errorData.status.join(", "),
            };
          }

          if (errorData?.name && Array.isArray(errorData.name)) {
            return {
              success: false,
              error: "Name error: " + errorData.name.join(", "),
            };
          }

          if (errorData?.image && Array.isArray(errorData.image)) {
            return {
              success: false,
              error: "Image upload failed: " + errorData.image.join(", "),
            };
          }

          // Generic 400 error
          return {
            success: false,
            error: `Bad request: ${
              JSON.stringify(errorData) || "Please check all required fields"
            }`,
          };
        }

        if (axiosError.response?.status === 413) {
          return {
            success: false,
            error: "File too large. Please upload a smaller image.",
          };
        }

        if (axiosError.response?.status === 415) {
          return {
            success: false,
            error: "Unsupported file type. Please upload a valid image.",
          };
        }

        // ✅ ADD: Handle other status codes
        return {
          success: false,
          error: `Server error (${axiosError.response?.status}): ${
            axiosError.response?.statusText || "Unknown error"
          }`,
        };
      }
    }

    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to create player",
    };
  }
};

/**
 * Get player by ID
 */
export const getPlayerById = async (id: number) => {
  try {
    // console.log("[Player API] Fetching player by ID:", id);

    const response = await apiEndpoint.get(
      `${PLAYER_ENDPOINTS.GET_PLAYER_BY_ID}${id}/`
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Player API] Error getting player by ID:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to get player",
    };
  }
};

/**
 * Update player by ID - Fixed version with proper multipart/form-data handling
 */
export const updatePlayer = async (
  id: number,
  playerData: UpdatePlayerData
) => {
  try {
    // console.log("[Player API] Updating player:", {
    //   id,
    //   data: {
    //     ...playerData,
    //     hasImage: !!playerData.image,
    //     imageType: playerData.image?.type,
    //   },
    // });

    const formData = createPlayerFormData(playerData);

    const response = await apiEndpoint.put(
      `${PLAYER_ENDPOINTS.UPDATE_PLAYER}${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Ensure the request timeout is sufficient for file uploads
        timeout: 30000, // 30 seconds
      }
    );

    // console.log("[Player API] Player updated successfully:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Player API] Error updating player:", error);

    // Enhanced error handling for file uploads
    if (error && typeof error === "object") {
      if ("response" in error) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as any;
          if (errorData?.image && Array.isArray(errorData.image)) {
            return {
              success: false,
              error: "Image upload failed: " + errorData.image.join(", "),
            };
          }
          return {
            success: false,
            error: "Bad request: Please check all required fields",
          };
        }
      }
    }

    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to update player",
    };
  }
};

/**
 * Delete player by ID
 */
export const deletePlayer = async (id: number) => {
  try {
    // console.log("[Player API] Deleting player:", id);

    const response = await apiEndpoint.delete(
      `${PLAYER_ENDPOINTS.DELETE_PLAYER}${id}/`
    );

    // console.log("[Player API] Player deleted successfully");

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Player API] Error deleting player:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to delete player",
    };
  }
};

// Export types
export type { Player, CreatePlayerData, UpdatePlayerData };
