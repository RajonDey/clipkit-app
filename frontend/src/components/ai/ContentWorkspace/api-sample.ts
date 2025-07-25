// Add this to your API client (e.g., api.ts)

export interface ContentGenerationRequest {
  idea_id: string;
  clip_ids: string[];
  content_type: string;
  tone: string;
  length: string;
  custom_instructions?: string; // Add this optional parameter
}

export interface ContentGenerationResponse {
  content: string;
  // Add any other fields your API returns
}

// Example implementation of the generate function
export const content = {
  generate: async (
    params: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> => {
    const response = await axios.post<ContentGenerationResponse>(
      `${API_BASE}/content/generate`,
      params,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },
};
