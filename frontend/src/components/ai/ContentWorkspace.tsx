"use client";

import React, { useState } from "react";
import { Clip, Idea } from "@/types/idea";
import { buttonStyles, inputStyles } from "@/styles/tokens";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import axios from "axios";
import "@/styles/markdown.css";

// Types for content generation
interface ContentGenerationParams {
  contentType: ContentType;
  tone: ToneType;
  length: LengthType;
}

type ContentType =
  | "article"
  | "script"
  | "social"
  | "outline"
  | "email"
  | "blog";
type ToneType =
  | "professional"
  | "casual"
  | "academic"
  | "creative"
  | "persuasive";
type LengthType = "short" | "medium" | "long";

interface ContentWorkspaceProps {
  idea: Idea;
  clips: Clip[];
}

export const ContentWorkspace: React.FC<ContentWorkspaceProps> = ({
  idea,
  clips,
}) => {
  // State for content parameters
  const [params, setParams] = useState<ContentGenerationParams>({
    contentType: "article",
    tone: "professional",
    length: "medium",
  }); // State for generated content
  const [generatedContent, setGeneratedContent] = useState<string>("");

  // State for loading status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // State for error messages
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State for selected clips (by default, all clips are selected)
  const [selectedClipIds, setSelectedClipIds] = useState<number[]>(
    clips.map((clip) => clip.id)
  );

  // Toggle clip selection
  const toggleClipSelection = (clipId: number) => {
    if (selectedClipIds.includes(clipId)) {
      setSelectedClipIds(selectedClipIds.filter((id) => id !== clipId));
    } else {
      setSelectedClipIds([...selectedClipIds, clipId]);
    }
  };

  // Handle parameter changes
  const handleParamChange = (
    key: keyof ContentGenerationParams,
    value: ContentType | ToneType | LengthType
  ) => {
    setParams({ ...params, [key]: value });
  };

  // Generate content
  const generateContent = async () => {
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
        clip_ids: selectedClipIds, // Use original IDs as the backend can now handle both numbers and strings
        content_type: params.contentType,
        tone: params.tone,
        length: params.length,
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

            // Debug info
            console.log("Auth error details:", {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers,
              token: localStorage.getItem("token")
                ? "Token exists"
                : "No token",
            });
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

              // Log more details for debugging
              console.error("Clip ID mismatch issue:", {
                selectedClipIds,
                availableClips: clips.map((c) => ({ id: c.id, type: c.type })),
              });
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

  // Copy generated content to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      // You could add a toast notification here
      alert("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy content: ", err);
    }
  };

  // Export content (placeholder for now)
  const exportContent = () => {
    // This could be expanded to support various export formats
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${idea.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4 mb-4">
        <h2 className="text-xl font-bold mb-2">AI Content Workspace</h2>
        <p className="text-sm text-neutral-500">
          Transform your clips into cohesive content with AI assistance
        </p>
      </div>

      {/* Parameters Section */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="font-medium mb-3">Content Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Content Type
            </label>
            <select
              className={`${inputStyles.default} w-full`}
              value={params.contentType}
              onChange={(e) =>
                handleParamChange("contentType", e.target.value as ContentType)
              }
            >
              <option value="article">Article</option>
              <option value="script">Video Script</option>
              <option value="social">Social Media Post</option>
              <option value="outline">Content Outline</option>
              <option value="email">Email</option>
              <option value="blog">Blog Post</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Tone
            </label>
            <select
              className={`${inputStyles.default} w-full`}
              value={params.tone}
              onChange={(e) =>
                handleParamChange("tone", e.target.value as ToneType)
              }
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
              <option value="creative">Creative</option>
              <option value="persuasive">Persuasive</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Length
            </label>
            <select
              className={`${inputStyles.default} w-full`}
              value={params.length}
              onChange={(e) =>
                handleParamChange("length", e.target.value as LengthType)
              }
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-4">
          <button
            className={`${buttonStyles.primary} w-full flex items-center justify-center gap-2`}
            onClick={generateContent}
            disabled={isGenerating || selectedClipIds.length === 0}
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span className="text-lg">🤖</span>
                Generate Content
              </>
            )}
          </button>

          {/* Error message */}
          {errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Clip Selection */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Clips to Include</h3>
          <button
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() =>
              selectedClipIds.length === clips.length
                ? setSelectedClipIds([])
                : setSelectedClipIds(clips.map((clip) => clip.id))
            }
          >
            {selectedClipIds.length === clips.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto border border-neutral-100 rounded-md bg-neutral-50 p-2">
          {clips.length === 0 ? (
            <div className="text-center text-neutral-400 py-4">
              No clips available. Add some clips first!
            </div>
          ) : (
            <div className="space-y-2">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition ${
                    selectedClipIds.includes(clip.id)
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-neutral-200 hover:bg-neutral-100"
                  }`}
                  onClick={() => toggleClipSelection(clip.id)}
                >
                  <div className="flex-shrink-0 mr-2">
                    <input
                      type="checkbox"
                      checked={selectedClipIds.includes(clip.id)}
                      onChange={() => {}} // Handled by the div onClick
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                  </div>
                  <div className="flex-1 truncate text-sm">
                    <span className="mr-2 font-medium">
                      {clip.type === "text" && "📝"}
                      {clip.type === "link" && "🔗"}
                      {clip.type === "image" && "🖼️"}
                      {clip.type === "video" && "🎬"}
                      {clip.type === "code" && "💻"}
                    </span>
                    {clip.type === "text"
                      ? clip.content.substring(0, 50) +
                        (clip.content.length > 50 ? "..." : "")
                      : clip.type === "image" ||
                        clip.type === "video" ||
                        clip.type === "link"
                      ? new URL(clip.content).hostname
                      : `Code snippet (${clip.lang || "unknown"})`}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {clip.tags.length > 0 && (
                      <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded">
                        {clip.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Output Area */}
      <div className="flex-1 flex flex-col border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 py-2 bg-neutral-50 flex justify-between items-center">
          <h3 className="font-medium">Generated Content</h3>
          {generatedContent && (
            <div className="space-x-2">
              <button
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                onClick={copyToClipboard}
              >
                Copy
              </button>
              <button
                className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                onClick={exportContent}
              >
                Export
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {generatedContent ? (
            <div className="prose max-w-none markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {generatedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400">
              <span className="text-4xl mb-4">🤖✨</span>
              <p className="text-center max-w-md">
                Configure your parameters and generate content from your clips.
                <br />
                Your generated content will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
