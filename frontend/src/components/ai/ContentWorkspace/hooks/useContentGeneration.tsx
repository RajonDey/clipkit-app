import { useState } from "react";
import { Clip, Idea } from "@/types/idea";
import axios from "axios";

interface ContentGenerationParams {
  contentType: string;
  tone: string;
  length: string;
}

export const useContentGeneration = (
  idea: Idea,
  orderedClips: Clip[],
  selectedClipIds: string[]
) => {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const generateContent = async (
    params: ContentGenerationParams,
    customInstructions?: string
  ) => {
    setIsGenerating(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      console.log(
        "Generate content with token:",
        token ? `${token.substring(0, 15)}...` : "No token"
      );

      if (!token) {
        setErrorMessage(
          "You must be logged in to generate content. Please log in and try again."
        );
        setIsGenerating(false);
        return;
      }

      // Debug token structure
      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          console.error(
            "Invalid JWT token format. Expected 3 parts, got:",
            parts.length
          );
          // Try to fix by removing quotes if they exist
          let cleanedToken = token;
          if (token.startsWith('"') && token.endsWith('"')) {
            cleanedToken = token.slice(1, -1);
            console.log(
              "Attempting to fix token by removing quotes:",
              cleanedToken
            );

            // Store the fixed token
            localStorage.setItem("token", cleanedToken);

            // Check if fixed token has correct format
            const fixedParts = cleanedToken.split(".");
            if (fixedParts.length !== 3) {
              setErrorMessage("Invalid token format. Please log in again.");
              setIsGenerating(false);
              return;
            }

            // Continue with fixed token
            console.log("Token fixed successfully. Continuing...");
          } else {
            setErrorMessage("Invalid token format. Please log in again.");
            setIsGenerating(false);
            return;
          }
        } else {
          const payload = JSON.parse(atob(parts[1]));
          console.log("Token payload for content gen:", payload);

          // Check if token is expired
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            console.error(
              "Token is expired! Expired at:",
              new Date(payload.exp * 1000).toLocaleString()
            );
            setErrorMessage("Your session has expired. Please log in again.");
            setIsGenerating(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error parsing JWT token:", e);
      }

      // Import dynamically to avoid circular dependencies
      const { content } = await import("@/lib/api");

      // Call the API to generate content
      const response = await content.generate({
        idea_id: idea.id,
        // Use ordered clips to ensure they're processed in the right sequence
        clip_ids: orderedClips
          .filter((clip) => selectedClipIds.includes(clip.id))
          .map((clip) => clip.id),
        content_type: params.contentType,
        tone: params.tone,
        length: params.length,
        custom_instructions: customInstructions,
      });

      setGeneratedContent(response.content);
    } catch (error) {
      console.error("Error generating content:", error);
      // Set error message for display
      if (axios.isAxiosError(error)) {
        // This is an Axios error (network or API related)
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401) {
            // Authentication error - try to get more details
            const errorDetail = error.response.data?.detail || "";
            setErrorMessage(
              `Authentication failed: ${errorDetail}. Try logging out and logging in again.`
            );
          } else if (error.response.status === 404) {
            // Resource not found error (likely idea not found)
            const errorDetail = error.response.data?.detail || "";
            if (errorDetail.includes("Idea not found")) {
              setErrorMessage(
                `This idea (ID: ${idea.id}) doesn't exist in the database or doesn't belong to your account. Make sure you've saved this idea first.`
              );
            } else if (errorDetail.includes("No clips found")) {
              setErrorMessage(
                `No clips were found for this idea. Please add some clips before generating content.`
              );
            } else if (errorDetail.includes("No matching clips found")) {
              setErrorMessage(
                `None of the selected clips could be found in the database. This might be due to a mismatch between frontend and backend clip IDs. Try refreshing the page or selecting different clips.`
              );
            } else {
              setErrorMessage(`Resource not found: ${errorDetail}`);
            }
          } else {
            setErrorMessage(
              `API Error: ${error.response.status} - ${
                error.response.data?.detail || error.message
              }`
            );
          }
        } else if (error.request) {
          // The request was made but no response was received
          setErrorMessage(
            `Network Error: No response received from server. Check if backend is running.`
          );
        } else {
          // Something happened in setting up the request
          setErrorMessage(`Request Error: ${error.message}`);
        }
      } else {
        // This is not an Axios error
        setErrorMessage(
          error instanceof Error
            ? `Error: ${error.message}`
            : "Failed to generate content. Please try again later."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatedContent,
    setGeneratedContent,
    isGenerating,
    errorMessage,
    generateContent,
  };
};

export default useContentGeneration;
