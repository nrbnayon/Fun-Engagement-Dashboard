// src\lib\services\advertisementDataApi.ts
import apiEndpoint from "@/lib/axios";

const ADVERTISEMENT_ENDPOINTS = {
  GET_ALL_ADVERTISEMENT: "/advertisements/",
  GET_ALL_LATEST_ADVERTISEMENT: "/advertisements/latest/",
  CREATE_ADVERTISEMENT: "/advertisements/",
  UPDATE_ADVERTISEMENT: "/advertisements/",
  DELETE_ADVERTISEMENT: "/advertisements/",
};

// Interface definitions
interface Advertisement {
  id: number;
  title: string;
  url: string | null;
  image: string | null;
  created_at: string;
}

interface CreateAdvertisementData {
  title: string;
  url?: string;
  image?: File;
}

interface UpdateAdvertisementData {
  title?: string;
  url?: string;
  image?: File;
}

const createAdvertisementFormData = (
  data: CreateAdvertisementData | UpdateAdvertisementData
): FormData => {
  const formData = new FormData();

  // Add all non-file fields with proper validation
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "image" && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Handle image file
  if (data.image && data.image instanceof File) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(data.image.type)) {
      formData.append("image", data.image, data.image.name);
    } else {
      throw new Error(
        `Invalid file type for image: ${
          data.image.type
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
    }
  }

  // Debug: Log FormData contents (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("[Advertisement API] FormData contents:");
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

// Get all advertisements
export const getAllAdvertisements = async (): Promise<{
  success: boolean;
  data?: Advertisement[];
}> => {
  try {
    const response = await apiEndpoint.get(
      ADVERTISEMENT_ENDPOINTS.GET_ALL_ADVERTISEMENT
    );
    console.log("All advertisements::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error failed get advertisements:", error);
    return {
      success: false,
    };
  }
};

// Get latest advertisement
export const getLatestAdvertisement = async (): Promise<{
  success: boolean;
  data?: Advertisement;
}> => {
  try {
    const response = await apiEndpoint.get(
      ADVERTISEMENT_ENDPOINTS.GET_ALL_LATEST_ADVERTISEMENT
    );
    console.log("Latest advertisement::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error failed get latest advertisement:", error);
    return {
      success: false,
    };
  }
};

// Create a new advertisement
export const createAdvertisement = async (
  advertisementData: CreateAdvertisementData
) => {
  try {
    console.log("[Advertisement API] Creating advertisement:", {
      title: advertisementData?.title,
      url: advertisementData?.url,
      has_image: !!advertisementData?.image,
    });

    const formData = createAdvertisementFormData(advertisementData);

    const response = await apiEndpoint.post(
      ADVERTISEMENT_ENDPOINTS.CREATE_ADVERTISEMENT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("Advertisement created::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error creating advertisement:", error);
    return {
      success: false,
    };
  }
};

// Update an advertisement by ID
export const updateAdvertisement = async (
  id: number,
  advertisementData: UpdateAdvertisementData
) => {
  try {
    console.log("[Advertisement API] Updating advertisement:", {
      id,
      title: advertisementData?.title,
      url: advertisementData?.url,
      has_image: !!advertisementData?.image,
    });

    const formData = createAdvertisementFormData(advertisementData);

    const response = await apiEndpoint.put(
      `${ADVERTISEMENT_ENDPOINTS.UPDATE_ADVERTISEMENT}${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("Advertisement updated::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error updating advertisement:", error);
    return {
      success: false,
    };
  }
};

// Delete an advertisement by ID
export const deleteAdvertisement = async (id: number) => {
  try {
    const response = await apiEndpoint.delete(
      `${ADVERTISEMENT_ENDPOINTS.DELETE_ADVERTISEMENT}${id}/`
    );
    console.log("Advertisement deleted::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error deleting advertisement:", error);
    return {
      success: false,
    };
  }
};

// Get a single advertisement by ID (bonus function)
export const getAdvertisementById = async (
  id: number
): Promise<{
  success: boolean;
  data?: Advertisement;
}> => {
  try {
    const response = await apiEndpoint.get(
      `${ADVERTISEMENT_ENDPOINTS.GET_ALL_ADVERTISEMENT}${id}/`
    );
    console.log("Advertisement by ID::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error getting advertisement by ID:", error);
    return {
      success: false,
    };
  }
};
