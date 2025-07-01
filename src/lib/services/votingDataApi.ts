// src/lib/services/votingDataApi.ts - FIXED VERSION
import apiEndpoint from "@/lib/axios";

const VOTING_ENDPOINTS = {
  GET_ALL_VOTINGS: "/votings/list/",
  CREATE_VOTING: "/votings/",
  GET_VOTING_BY_ID: "/votings/",
  UPDATE_VOTING: "/votings/",
  DELETE_VOTING: "/votings/",
};

// Interface definitions
interface Voting {
  id: number;
  match_id: number;
  user_id: number;
  team_voted: string;
  created_at: string;
  updated_at: string;
}

interface CreateVotingData {
  match_id: number;
  team_voted: string;
}

interface UpdateVotingData {
  team_voted?: string;
}

//  Get all votings with better error handling
export const getAllVotings = async () => {
  try {
    console.log("[Voting API] Fetching all votings...");

    const response = await apiEndpoint.get(VOTING_ENDPOINTS.GET_ALL_VOTINGS);

    console.log("[Voting API] Success:", {
      status: response.status,
      dataLength: Array.isArray(response.data)
        ? response.data.length
        : "not array",
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Voting API] Error getting all votings:", error);

    // More detailed error logging
    if (error && typeof error === "object" && "message" in error) {
      console.error("[Voting API] Error details:", {
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

// Create a new voting
export const createVoting = async (votingData: CreateVotingData) => {
  try {
    console.log("[Voting API] Creating voting:", votingData);

    const response = await apiEndpoint.post(
      VOTING_ENDPOINTS.CREATE_VOTING,
      votingData
    );

    console.log("[Voting API] Voting created successfully");

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Voting API] Error creating voting:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to create voting",
    };
  }
};

// Get voting by ID
export const getVotingById = async (id: number) => {
  try {
    console.log("[Voting API] Fetching voting by ID:", id);

    const response = await apiEndpoint.get(
      `${VOTING_ENDPOINTS.GET_VOTING_BY_ID}${id}/`
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Voting API] Error getting voting by ID:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to get voting",
    };
  }
};

// Update voting by ID
export const updateVoting = async (
  id: number,
  votingData: UpdateVotingData
) => {
  try {
    console.log("[Voting API] Updating voting:", { id, data: votingData });

    const response = await apiEndpoint.put(
      `${VOTING_ENDPOINTS.UPDATE_VOTING}${id}/`,
      votingData
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Voting API] Error updating voting:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to update voting",
    };
  }
};

// Delete voting by ID
export const deleteVoting = async (id: number) => {
  try {
    console.log("[Voting API] Deleting voting:", id);

    const response = await apiEndpoint.delete(
      `${VOTING_ENDPOINTS.DELETE_VOTING}${id}/`
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("[Voting API] Error deleting voting:", error);
    return {
      success: false,
      error:
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to delete voting",
    };
  }
};

// Export types
export type { Voting, CreateVotingData, UpdateVotingData };
