// src\lib\services\matchDataApi.ts
import apiEndpoint from "@/lib/axios";

const MATCH_ENDPOINTS = {
  GET_ALL_MATCH: "/matches/",
  CREATE_MATCH: "/matches/",
  FILTER_MATCHES: "/matches/filter/",
  UPDATE_MATCH: "/matches/",
  DELETE_MATCH: "/matches/",
};

// Interface definitions
interface Player {
  id: number;
  image: string;
  name: string;
  jersey_number: number;
  status: string;
}

interface Match {
  id: number;
  team_a: string;
  team_b: string;
  time: string;
  date: string;
  selected_players: Player[];
  winner: string | null;
  status: string;
  win_name: string | null;
  match_timezone: string | null;
}

interface CreateMatchData {
  team_a_name: string;
  team_a_pics?: File;
  team_b_name: string;
  team_b_pics?: File;
  time: string;
  date: string;
  selected_players_ids: number[];
}

interface UpdateMatchData {
  team_a_name?: string;
  team_a_pics?: File;
  team_b_name?: string;
  team_b_pics?: File;
  time?: string;
  date?: string;
  selected_players_ids?: number[];
  status?: string;
  winner?: string;
}

interface FilterMatchesResponse {
  live_matches: Match[];
  upcoming_matches: Match[];
}

const createMatchFormData = (
  data: CreateMatchData | UpdateMatchData
): FormData => {
  const formData = new FormData();

  // Add all non-file fields with proper validation
  Object.entries(data).forEach(([key, value]) => {
    if (
      key !== "team_a_pics" &&
      key !== "team_b_pics" &&
      value !== undefined &&
      value !== null
    ) {
      if (Array.isArray(value)) {
        // Handle arrays properly for FormData
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else if (typeof value === "number") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("Time zone:::", userTimezone);
  formData.append("match_timezone", userTimezone);

  // Handle team A image file
  if (data.team_a_pics && data.team_a_pics instanceof File) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(data.team_a_pics.type)) {
      formData.append("team_a_pics", data.team_a_pics, data.team_a_pics.name);
    } else {
      throw new Error(
        `Invalid file type for team A image: ${
          data.team_a_pics.type
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
    }
  }

  // Handle team B image file
  if (data.team_b_pics && data.team_b_pics instanceof File) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(data.team_b_pics.type)) {
      formData.append("team_b_pics", data.team_b_pics, data.team_b_pics.name);
    } else {
      throw new Error(
        `Invalid file type for team B image: ${
          data.team_b_pics.type
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
    }
  }

  // Debug: Log FormData contents (only in development)
  if (process.env.NODE_ENV === "development") {
    // console.log("[Match API] FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
  }

  return formData;
};

// Get all matches
export const getAllMatch = async () => {
  try {
    const response = await apiEndpoint.get(MATCH_ENDPOINTS.GET_ALL_MATCH);
    // console.log("All match::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error failed get matches:", error);
    return {
      success: false,
    };
  }
};

// Create a new match
export const createMatch = async (matchData: CreateMatchData) => {
  try {
    // console.log("[Match API] Creating match:", {
    //   team_a_name: matchData?.team_a_name,
    //   team_b_name: matchData?.team_b_name,
    //   time: matchData?.time,
    //   date: matchData?.date,
    //   selected_players_ids: matchData?.selected_players_ids,
    //   has_team_a_pics: !!matchData?.team_a_pics,
    //   has_team_b_pics: !!matchData?.team_b_pics,
    // });

    const formData = createMatchFormData(matchData);

    const response = await apiEndpoint.post(
      MATCH_ENDPOINTS.CREATE_MATCH,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    // console.log("Match created::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error creating match:", error);
    return {
      success: false,
    };
  }
};

// Get filtered matches (live and upcoming)
export const getFilteredMatches = async (): Promise<{
  success: boolean;
  data?: FilterMatchesResponse;
}> => {
  try {
    const response = await apiEndpoint.get(MATCH_ENDPOINTS.FILTER_MATCHES);
    // console.log("Filtered matches::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error getting filtered matches:", error);
    return {
      success: false,
    };
  }
};

// Update a match by ID
export const updateMatch = async (id: number, matchData: UpdateMatchData) => {
  try {
    // console.log("[Match API] Updating match:", {
    //   id,
    //   team_a_name: matchData?.team_a_name,
    //   team_b_name: matchData?.team_b_name,
    //   time: matchData?.time,
    //   date: matchData?.date,
    //   selected_players_ids: matchData?.selected_players_ids,
    //   status: matchData?.status,
    //   winner: matchData?.winner,
    //   has_team_a_pics: !!matchData?.team_a_pics,
    //   has_team_b_pics: !!matchData?.team_b_pics,
    // });

    const formData = createMatchFormData(matchData);

    const response = await apiEndpoint.put(
      `${MATCH_ENDPOINTS.UPDATE_MATCH}${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    // console.log("Match updated::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error updating match:", error);
    return {
      success: false,
    };
  }
};

// Delete a match by ID
export const deleteMatch = async (id: number) => {
  try {
    const response = await apiEndpoint.delete(
      `${MATCH_ENDPOINTS.DELETE_MATCH}${id}/`
    );
    // console.log("Match deleted::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error deleting match:", error);
    return {
      success: false,
    };
  }
};

// Get a single match by ID (bonus function)
export const getMatchById = async (id: number) => {
  try {
    const response = await apiEndpoint.get(
      `${MATCH_ENDPOINTS.GET_ALL_MATCH}${id}/`
    );
    // console.log("Match by ID::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error getting match by ID:", error);
    return {
      success: false,
    };
  }
};
