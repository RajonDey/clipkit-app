"use client";

import React, { useState, useRef } from "react";
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
  });

  // State for generated content
  const [generatedContent, setGeneratedContent] = useState<string>("");

  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // State for edited content (used in edit mode)
  const [editedContent, setEditedContent] = useState<string>("");

  // State for loading status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // State for error messages
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State for clip filtering
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // State for selected clips (by default, all clips are selected)
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>(
    clips.map((clip) => clip.id)
  );

  // State for clip order
  const [orderedClips, setOrderedClips] = useState<Clip[]>(clips);

  // State for drag and drop
  const [draggedClip, setDraggedClip] = useState<Clip | null>(null);

  // State for clip preview
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);

  // State for export menu
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Filtered clips based on active filter
  const filteredClips = orderedClips.filter(
    (clip) => activeFilter === "all" || clip.type === activeFilter
  );

  // Update ordered clips when clips prop changes
  React.useEffect(() => {
    setOrderedClips(clips);
  }, [clips]);

  // Handle drag start
  const handleDragStart = (clip: Clip) => {
    setDraggedClip(clip);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetClip: Clip) => {
    e.preventDefault();
    if (!draggedClip || draggedClip.id === targetClip.id) return;

    // Reorder clips
    const newOrderedClips = [...orderedClips];
    const draggedIndex = newOrderedClips.findIndex(
      (c) => c.id === draggedClip.id
    );
    const targetIndex = newOrderedClips.findIndex(
      (c) => c.id === targetClip.id
    );

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrderedClips.splice(draggedIndex, 1);
      newOrderedClips.splice(targetIndex, 0, draggedClip);
      setOrderedClips(newOrderedClips);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedClip(null);
  };

  // Open preview for a clip
  const openPreview = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation(); // Prevent toggling selection
    setPreviewClip(clip);
  };

  // Close preview
  const closePreview = () => {
    setPreviewClip(null);
  };

  // Toggle clip selection
  const toggleClipSelection = (clipId: string) => {
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
        // Use ordered clips to ensure they're processed in the right sequence
        clip_ids: orderedClips
          .filter((clip) => selectedClipIds.includes(clip.id))
          .map((clip) => clip.id),
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

  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    // Add success message/toast here
  };

  // Export content
  const exportContent = (format: "markdown" | "html" | "text") => {
    // Create file content based on format
    let fileContent = generatedContent;
    let extension = "md";
    let mimeType = "text/markdown";

    if (format === "html") {
      // Simple markdown to HTML conversion
      const html = generatedContent
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      fileContent = `<!DOCTYPE html><html><head><title>Generated Content</title></head><body>${html}</body></html>`;
      extension = "html";
      mimeType = "text/html";
    } else if (format === "text") {
      // Strip markdown formatting
      fileContent = generatedContent
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1");
      extension = "txt";
      mimeType = "text/plain";
    }

    // Create a download link
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-content.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Add success message/toast here
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

        {/* Clip Type Filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            className={`text-xs px-3 py-1 rounded-full transition ${
              activeFilter === "all"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
              activeFilter === "text"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("text")}
          >
            <span className="mr-1">📝</span> Text
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
              activeFilter === "link"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("link")}
          >
            <span className="mr-1">🔗</span> Links
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
              activeFilter === "image"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("image")}
          >
            <span className="mr-1">🖼️</span> Images
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
              activeFilter === "video"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("video")}
          >
            <span className="mr-1">🎬</span> Videos
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
              activeFilter === "code"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
            }`}
            onClick={() => setActiveFilter("code")}
          >
            <span className="mr-1">💻</span> Code
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto border border-neutral-100 rounded-md bg-neutral-50 p-2">
          {clips.length === 0 ? (
            <div className="text-center text-neutral-400 py-4">
              No clips available. Add some clips first!
            </div>
          ) : filteredClips.length === 0 ? (
            <div className="text-center text-neutral-400 py-4">
              No clips match the selected filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition ${
                    selectedClipIds.includes(clip.id)
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-neutral-200 hover:bg-neutral-100"
                  } ${draggedClip?.id === clip.id ? "opacity-50" : ""}`}
                  onClick={() => toggleClipSelection(clip.id)}
                  draggable
                  onDragStart={() => handleDragStart(clip)}
                  onDragOver={(e) => handleDragOver(e, clip)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className="flex-shrink-0 mr-2 cursor-grab"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      className="h-4 w-4 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </div>
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

                    {/* Preview button for media */}
                    {(clip.type === "image" || clip.type === "video") && (
                      <button
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 px-1 rounded"
                        onClick={(e) => openPreview(e, clip)}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {clip.tags && clip.tags.length > 0 && (
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
              <div className="relative inline-block">
                <button
                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:bg-green-50 flex items-center"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  Export <span className="ml-1">▾</span>
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-neutral-200">
                    <button
                      className="block w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100"
                      onClick={() => {
                        exportContent("markdown");
                        setShowExportMenu(false);
                      }}
                    >
                      Markdown (.md)
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100"
                      onClick={() => {
                        exportContent("html");
                        setShowExportMenu(false);
                      }}
                    >
                      HTML (.html)
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100"
                      onClick={() => {
                        exportContent("text");
                        setShowExportMenu(false);
                      }}
                    >
                      Plain Text (.txt)
                    </button>
                  </div>
                )}
              </div>
              <button
                className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setEditedContent(generatedContent);
                  }
                }}
              >
                {isEditing ? "View" : "Edit"}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {generatedContent ? (
            isEditing ? (
              <div className="h-full flex flex-col">
                <textarea
                  className="w-full h-full min-h-[300px] p-3 border border-neutral-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Edit your content here..."
                />

                {/* Media insertion toolbar */}
                <div className="flex items-center space-x-3 my-2 p-2 bg-neutral-50 rounded-md border border-neutral-200">
                  <span className="text-xs text-neutral-500">Insert:</span>
                  <div className="flex space-x-1">
                    {filteredClips
                      .filter((clip) => clip.type === "image")
                      .slice(0, 3) // Show up to 3 recent images
                      .map((clip) => (
                        <button
                          key={clip.id}
                          className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center"
                          onClick={() => {
                            const imageRef = `\n![${
                              clip.content.split("/").pop() || "Image"
                            }](${clip.content})\n`;
                            setEditedContent(editedContent + imageRef);
                          }}
                        >
                          <span className="mr-1">🖼️</span> Image
                        </button>
                      ))}

                    {filteredClips
                      .filter((clip) => clip.type === "video")
                      .slice(0, 2) // Show up to 2 recent videos
                      .map((clip) => (
                        <button
                          key={clip.id}
                          className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center"
                          onClick={() => {
                            const videoRef = `\n<video src="${clip.content}" controls></video>\n`;
                            setEditedContent(editedContent + videoRef);
                          }}
                        >
                          <span className="mr-1">🎬</span> Video
                        </button>
                      ))}
                  </div>

                  {/* Formatting buttons */}
                  <div className="ml-auto flex space-x-1">
                    <button
                      className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
                      onClick={() =>
                        setEditedContent(editedContent + "**Bold text**")
                      }
                    >
                      B
                    </button>
                    <button
                      className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300 italic"
                      onClick={() =>
                        setEditedContent(editedContent + "*Italic text*")
                      }
                    >
                      I
                    </button>
                    <button
                      className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
                      onClick={() =>
                        setEditedContent(editedContent + "\n## Heading\n")
                      }
                    >
                      H
                    </button>
                    <button
                      className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
                      onClick={() =>
                        setEditedContent(
                          editedContent + "\n- List item\n- List item\n"
                        )
                      }
                    >
                      • List
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    className="text-xs text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(generatedContent); // Reset to original
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-xs text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-50"
                    onClick={() => {
                      setGeneratedContent(editedContent);
                      setIsEditing(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {generatedContent}
                </ReactMarkdown>
              </div>
            )
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

      {/* Clip Preview Modal */}
      {previewClip && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {previewClip.type === "image"
                  ? "Image Preview"
                  : "Video Preview"}
              </h3>
              <button
                className="text-neutral-500 hover:text-neutral-800"
                onClick={closePreview}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center">
              {previewClip.type === "image" ? (
                <img
                  src={previewClip.content}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : previewClip.type === "video" ? (
                <video
                  src={previewClip.content}
                  controls
                  className="max-w-full max-h-[70vh]"
                >
                  Your browser does not support the video tag.
                </video>
              ) : null}

              {/* Reference code */}
              <div className="mt-4 w-full">
                <h4 className="font-medium mb-2">Reference in content:</h4>
                <div className="bg-neutral-100 p-3 rounded font-mono text-sm">
                  {previewClip.type === "image"
                    ? `![${previewClip.content.split("/").pop() || "Image"}](${
                        previewClip.content
                      })`
                    : `<video src="${previewClip.content}" controls></video>`}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Copy this code to reference this media in your content.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
