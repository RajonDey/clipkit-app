import axios from "axios";

// Get the API URL from environment variable or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

console.log("API_URL configured as:", API_URL);
console.log("NEXT_PUBLIC_API_URL from env:", process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("No refresh token available");
      return null;
    }

    console.log("Attempting to refresh token...");
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;

    // Store the new tokens
    localStorage.setItem("token", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    console.log("Token refreshed successfully");
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Clear tokens on refresh failure
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  // Only run this in browser environment (not during SSR)
  if (typeof window !== "undefined") {
    // Don't add token for auth endpoints
    if (
      config.url &&
      (config.url.includes("/auth/login") ||
        config.url.includes("/auth/refresh"))
    ) {
      return config;
    }

    let token = localStorage.getItem("token");
    console.log(
      "Token from localStorage:",
      token ? `${token.substring(0, 15)}...` : "No token found"
    );

    if (token) {
      // Clean up token if needed (remove quotes)
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
        console.log("Cleaned up token by removing quotes");
        localStorage.setItem("token", token); // Save the clean token back
      } // Debug token structure
      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          console.error(
            "Invalid JWT token format. Expected 3 parts, got:",
            parts.length
          );
        } else {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          console.log("Token header:", header);
          console.log("Token payload:", payload);
          console.log(
            "Token expiration:",
            new Date(payload.exp * 1000).toLocaleString()
          );

          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            console.error(
              "Token is expired! Expired at:",
              new Date(payload.exp * 1000).toLocaleString()
            );
            // We'll let the response interceptor handle the expired token
          }
        }
      } catch (e) {
        console.error("Error parsing JWT token:", e);
      }

      // Properly format the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header:", config.headers.Authorization);
    } else {
      console.warn("No token found in localStorage");
    }
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response, // Return successful responses as-is
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== `${API_URL}/auth/refresh` &&
      originalRequest.url !== `${API_URL}/auth/login`
    ) {
      console.log("401 error detected. Trying to refresh token...");

      // Mark that we've tried to refresh for this request
      originalRequest._retry = true;

      // Try to refresh the token
      const newToken = await refreshToken();

      if (newToken) {
        console.log("Using new token for request");
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } else {
        console.log("Token refresh failed, redirecting to login");

        // If we're in a browser context, redirect to login
        if (typeof window !== "undefined") {
          // Redirect to login page
          window.location.href = "/auth";
        }
      }
    }

    // Return the error for other types of errors
    return Promise.reject(error);
  }
);

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface ContentGenerationRequest {
  idea_id: string;
  clip_ids: (number | string)[]; // Accept both numbers and strings
  content_type: string;
  tone: string;
  length: string;
}

interface IdeaCreateData {
  name: string;
  category?: string;
  tags?: string[];
}

interface IdeaUpdateData {
  name?: string;
  category?: string;
  tags?: string[];
}

interface ClipCreateData {
  type: string;
  value: string;
  tags?: string[];
  idea_id?: string;
  lang?: string; // For code snippets
}

interface ClipUpdateData {
  type?: string;
  value?: string;
  tags?: string[];
}

interface IdeaCreateData {
  name: string;
  category?: string;
}

interface IdeaUpdateData {
  name?: string;
  category?: string;
}

// API methods for authentication
export const auth = {
  login: async (data: LoginData) => {
    console.log("Preparing login request with data:", {
      username: data.username,
    });

    // For OAuth2 form authentication with FastAPI
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    // Log the form data for debugging (don't log actual password)
    console.log(
      "Form data being sent:",
      formData.toString().replace(/password=.+/, "password=REDACTED")
    );
    console.log("Content type:", "application/x-www-form-urlencoded");
    console.log("Endpoint:", `${API_URL}/auth/login`);

    try {
      console.log("Sending login request to:", `${API_URL}/auth/login`);

      // Add a brief delay to ensure console logs appear in the right order
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Make sure we're using the right content type for FastAPI OAuth2 form
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Login response received with status:", response.status);
      console.log("Login response headers:", response.headers);
      console.log("Login response data:", response.data);

      // Store both access token and refresh token
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        console.log(
          "Access token stored in localStorage, length:",
          response.data.access_token.length
        );
      } else {
        console.error("No access token in response");
      }

      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
        console.log(
          "Refresh token stored in localStorage, length:",
          response.data.refresh_token.length
        );
      } else {
        console.warn("No refresh token in response");
      }

      return response.data;
    } catch (error) {
      console.error("Login request failed:", error);

      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Axios error detected");

        if (error.response) {
          console.error("Error status:", error.response.status);
          console.error("Error data:", error.response.data);
          console.error("Error headers:", error.response.headers);
        } else if (error.request) {
          console.error(
            "Error request sent but no response received:",
            error.request
          );
        } else {
          console.error("Error setting up request:", error.message);
        }

        console.error("Error config:", error.config);
      }

      throw error;
    }
  },

  register: async (data: RegisterData) => {
    console.log("Preparing register request with data:", {
      email: data.email,
      name: data.name,
      // Don't log passwords, even partially
    });

    try {
      console.log("Sending register request to:", `${API_URL}/auth/register`);

      // Use axios directly for consistent error handling
      const response = await axios.post(`${API_URL}/auth/register`, data);

      console.log("Register response received:", {
        status: response.status,
        data: response.data,
      });

      // Store both access token and refresh token
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        console.log("Access token stored in localStorage");
      }

      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
        console.log("Refresh token stored in localStorage");
      }

      return response.data;
    } catch (error) {
      console.error("Register request failed:", error);

      // More detailed error logging
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }

      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    console.log("User logged out");
  },

  refreshToken: async () => {
    return await refreshToken();
  },
};

// API methods for content generation
export const content = {
  generate: async (data: ContentGenerationRequest) => {
    try {
      console.log("Generating content:", data);
      const response = await api.post("/content/generate", data);
      console.log("Content generation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  },
};

// API methods for ideas
export const ideas = {
  getAll: async () => {
    try {
      console.log("Fetching all ideas");
      const response = await api.get("/ideas");
      console.log("Ideas response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching ideas:", error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`Fetching idea with ID: ${id}`);
      const response = await api.get(`/ideas/${id}`);
      console.log("Idea details response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching idea ${id}:`, error);
      throw error;
    }
  },

  create: async (data: IdeaCreateData) => {
    try {
      console.log("Creating new idea:", data);
      const response = await api.post("/ideas", data);
      console.log("Idea creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating idea:", error);
      throw error;
    }
  },

  update: async (id: string, data: IdeaUpdateData) => {
    try {
      console.log(`Updating idea ${id}:`, data);
      const response = await api.put(`/ideas/${id}`, data);
      console.log("Idea update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating idea ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      console.log(`Deleting idea ${id}`);
      const response = await api.delete(`/ideas/${id}`);
      console.log("Idea deletion response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting idea ${id}:`, error);
      throw error;
    }
  },
};

// API methods for clips
export const clips = {
  getAll: async () => {
    try {
      console.log("Fetching all clips");
      const response = await api.get("/clips");
      console.log("Clips response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching clips:", error);
      throw error;
    }
  },

  getByIdea: async (ideaId: string) => {
    try {
      console.log(`Fetching clips for idea ${ideaId}`);
      const response = await api.get(`/clips?idea=${ideaId}`);
      console.log(`Clips for idea ${ideaId} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching clips for idea ${ideaId}:`, error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      console.log(`Fetching clip ${id}`);
      const response = await api.get(`/clips/${id}`);
      console.log("Clip response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching clip ${id}:`, error);
      throw error;
    }
  },

  create: async (ideaId: string, data: ClipCreateData) => {
    try {
      console.log(`Creating clip for idea ${ideaId}:`, data);
      // Add idea ID to clip data and transform field names to match backend
      const clipData = {
        type: data.type,
        content: data.value, // Backend expects content instead of value
        idea_id: ideaId,
        tags: data.tags || [],
        lang: data.lang || null,
      };
      const response = await api.post("/clips", clipData);
      console.log("Clip creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error creating clip for idea ${ideaId}:`, error);
      throw error;
    }
  },

  update: async (id: string, data: ClipUpdateData) => {
    try {
      console.log(`Updating clip ${id}:`, data);
      const response = await api.put(`/clips/${id}`, data);
      console.log("Clip update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating clip ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      console.log(`Deleting clip ${id}`);
      const response = await api.delete(`/clips/${id}`);
      console.log("Clip deletion response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting clip ${id}:`, error);
      throw error;
    }
  },
};

// Export the axios instance for direct use
export default api;
