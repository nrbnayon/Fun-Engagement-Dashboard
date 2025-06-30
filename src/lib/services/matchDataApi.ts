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
}

interface CreateMatchData {
  team_a: string;
  team_b: string;
  time: string;
  date: string;
  selected_players_ids: number[];
}

interface UpdateMatchData {
  team_a?: string;
  team_b?: string;
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

// Get all matches
export const getAllMatch = async () => {
  try {
    const response = await apiEndpoint.get(MATCH_ENDPOINTS.GET_ALL_MATCH);
    console.log("All match::", response.data);
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
    const response = await apiEndpoint.post(
      MATCH_ENDPOINTS.CREATE_MATCH,
      matchData
    );
    console.log("Match created::", response.data);
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
    console.log("Filtered matches::", response.data);
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
    const response = await apiEndpoint.put(
      `${MATCH_ENDPOINTS.UPDATE_MATCH}${id}/`,
      matchData
    );
    console.log("Match updated::", response.data);
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
    console.log("Match deleted::", response.data);
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
    console.log("Match by ID::", response.data);
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
