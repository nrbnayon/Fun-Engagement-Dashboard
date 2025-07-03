// src\lib\services\newsDataApi.ts
import apiEndpoint from "@/lib/axios";

const NEWS_ENDPOINTS = {
  GET_ALL_NEWS: "/news/",
  CREATE_NEWS: "/news/",
  UPDATE_NEWS: "/news/",
  DELETE_NEWS: "/news/",
};

// Interface definitions
interface News {
  id: number;
  image: string;
  title: string;
  description: string;
  upload_date: string;
}

interface CreateNewsData {
  image: File;
  title: string;
  description: string;
}

interface UpdateNewsData {
  image?: File;
  title?: string;
  description?: string;
}

const createNewsFormData = (
  data: CreateNewsData | UpdateNewsData
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
    console.log("[News API] FormData contents:");
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

// Get all news
export const getAllNews = async (): Promise<{
  success: boolean;
  data?: News[];
}> => {
  try {
    const response = await apiEndpoint.get(NEWS_ENDPOINTS.GET_ALL_NEWS);
    console.log("All news::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error failed get news:", error);
    return {
      success: false,
    };
  }
};

// Create a new news
export const createNews = async (newsData: CreateNewsData) => {
  try {
    console.log("[News API] Creating news:", {
      title: newsData?.title,
      description: newsData?.description,
      has_image: !!newsData?.image,
    });

    const formData = createNewsFormData(newsData);

    const response = await apiEndpoint.post(
      NEWS_ENDPOINTS.CREATE_NEWS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("News created::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error creating news:", error);
    return {
      success: false,
    };
  }
};

// Update a news by ID
export const updateNews = async (id: number, newsData: UpdateNewsData) => {
  try {
    console.log("[News API] Updating news:", {
      id,
      title: newsData?.title,
      description: newsData?.description,
      has_image: !!newsData?.image,
    });

    const formData = createNewsFormData(newsData);

    const response = await apiEndpoint.put(
      `${NEWS_ENDPOINTS.UPDATE_NEWS}${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    console.log("News updated::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error updating news:", error);
    return {
      success: false,
    };
  }
};

// Delete a news by ID
export const deleteNews = async (id: number) => {
  try {
    const response = await apiEndpoint.delete(
      `${NEWS_ENDPOINTS.DELETE_NEWS}${id}/`
    );
    console.log("News deleted::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error deleting news:", error);
    return {
      success: false,
    };
  }
};

// Get a single news by ID (bonus function)
export const getNewsById = async (
  id: number
): Promise<{
  success: boolean;
  data?: News;
}> => {
  try {
    const response = await apiEndpoint.get(
      `${NEWS_ENDPOINTS.GET_ALL_NEWS}${id}/`
    );
    console.log("News by ID::", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Error getting news by ID:", error);
    return {
      success: false,
    };
  }
};
