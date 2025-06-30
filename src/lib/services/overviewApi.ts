// src\lib\services\overviewApi.ts
import apiEndpoint from "@/lib/axios";
const OVERVIEW_ENDPOINTS = {
  STATS: "/engagement-stats-totals/",
};

export const getOverViewStats = async () => {
  try {
    const response = await apiEndpoint.get(OVERVIEW_ENDPOINTS.STATS);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error failed get stats:", error);
    return {
      success: false,
    };
  }
};


