"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Idea, Clip, ClipType, ContentTypeOption } from "@/types/idea";
import { ClipModal } from "@/components/clips/ClipModal";
import { ClipSection } from "@/components/clips/ClipSection";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { AddClipModal } from "@/components/clips/AddClipModal";
import { ContentWorkspace } from "@/components/ai/ContentWorkspace";
import axios from "axios";
import * as api from "@/lib/api";

// Content type options for filtering
const contentTypes: ContentTypeOption[] = [
  { value: "all", label: "All" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "code", label: "Code" },
  { value: "link", label: "Link" },
];

/**
 * Page component for the idea workspace
 */
export default function Page() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params?.id as string;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | ClipType>("all");
  const [clips, setClips] = useState<Clip[]>([]);

  // Editable title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Add tag
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Modal for previewing/editing a clip
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Modal for adding a new clip
  const [showAddClipModal, setShowAddClipModal] = useState(false);

  // Check if ID looks valid (UUID format)
  const isValidUUID = (id: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Fetch idea and clips data from API
  useEffect(() => {
    if (!ideaId) {
      router.push("/dashboard");
      return;
    }

    // Check if the ID looks like a valid UUID
    if (!isValidUUID(ideaId)) {
      console.error(`Invalid idea ID format: ${ideaId}. Expected UUID format.`);
      setError(
        `The ID "${ideaId}" doesn't look like a valid idea ID. Please check the URL.`
      );
      setLoading(false);
      return;
    }

    const fetchIdeaData = async () => {
      try {
        setLoading(true);
        // Check for token first
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          console.log("No authentication token found, redirecting to login");
          router.push("/auth");
          return;
        }

        console.log(`Attempting to fetch idea with ID: ${ideaId}`);

        // Fetch idea details
        const ideaData = await api.ideas.getById(ideaId);
        console.log("Idea data received:", ideaData);

        // Transform API data to match our frontend model
        const transformedIdea: Idea = {
          id: ideaData.id,
          title: ideaData.name,
          description: ideaData.category || "No description available",
          tags: ideaData.tags || [],
          clips: [],
        };

        setIdea(transformedIdea);
        setEditedTitle(transformedIdea.title);

        // Fetch clips for this idea
        console.log(`Fetching clips for idea: ${ideaId}`);
        const clipsData = await api.clips.getByIdea(ideaId);
        console.log("Clips data received:", clipsData);

        // Transform API clips to match our frontend model
        interface ApiClip {
          id: string;
          type: string;
          value: string;
          created_at: string;
          tags?: Array<{ name: string }>;
        }

        const transformedClips: Clip[] = Array.isArray(clipsData)
          ? clipsData.map((clip: ApiClip) => ({
              id: clip.id, // Keep as string ID instead of converting to number
              type: clip.type as ClipType,
              content: clip.value,
              created: clip.created_at || new Date().toISOString().slice(0, 10),
              tags: clip.tags?.map((tag) => tag.name) || [],
            }))
          : [];

        setClips(transformedClips);
        setError(null);
      } catch (err) {
        console.error("Error fetching idea data:", err);

        // Enhanced error logging
        if (axios.isAxiosError(err)) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response) {
            console.error("Error response data:", err.response.data);
            console.error("Error response status:", err.response.status);

            if (err.response.status === 401 || err.response.status === 403) {
              console.log("Authentication error, redirecting to login");
              if (typeof window !== "undefined") {
                localStorage.removeItem("token"); // Clear invalid token
              }
              router.push("/auth");
              return;
            } else if (err.response.status === 404) {
              setError(
                `Idea with ID ${ideaId} not found. Please check the URL and try again.`
              );
            } else {
              const detail =
                err.response.data?.detail || "Unknown server error";
              setError(`Server error: ${detail}`);
            }
          } else if (err.request) {
            // The request was made but no response was received
            console.error("No response received:", err.request);
            setError(
              "Failed to connect to the server. Please check your internet connection."
            );
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error details:", err.message);
            setError(`Failed to load idea: ${err.message || "Unknown error"}`);
          }
        } else {
          // Non-axios error
          console.error("Non-axios error:", err);
          setError(
            `Failed to load idea: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdeaData();
  }, [ideaId, router]);

  /**
   * Filters clips based on the active tab
   */
  const filteredClips =
    activeTab === "all" ? clips : clips.filter((c) => c.type === activeTab);

  /**
   * Handles adding a new clip to the collection
   */
  const handleAddClip = async (
    type: ClipType,
    content: string,
    tag: string
  ) => {
    if (!content.trim()) return;

    try {
      // Call API to create clip
      const apiResponse = await api.clips.create(ideaId, {
        type,
        value: content,
        tags: tag ? [tag] : [],
      });

      // Transform API response to frontend model
      const newClip: Clip = {
        id: apiResponse.id, // Keep as string instead of parsing to int
        type,
        content,
        created: new Date().toISOString().slice(0, 10),
        tags: tag ? [tag] : [],
      };

      setClips([newClip, ...clips]);
    } catch (error) {
      console.error("Error adding clip:", error);
      // TODO: Add error handling UI
    }
  };

  /**
   * Updates the content of a clip
   */
  const handleClipContentChange = async (clipId: string, content: string) => {
    try {
      // Call API to update clip
      await api.clips.update(clipId, {
        value: content,
      });

      // Update local state
      setClips(clips.map((c) => (c.id === clipId ? { ...c, content } : c)));
    } catch (error) {
      console.error("Error updating clip:", error);
      // TODO: Add error handling UI
    }
  };

  /**
   * Deletes a clip
   */
  const handleDeleteClip = async (clipId: string) => {
    try {
      // Call API to delete clip
      await api.clips.delete(clipId);

      // Update local state
      setClips(clips.filter((c) => c.id !== clipId));
    } catch (error) {
      console.error("Error deleting clip:", error);
      // TODO: Add error handling UI
    }
  }; // Handle updating the idea title
  const handleUpdateTitle = async () => {
    if (!idea || editedTitle === idea.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      // Call API to update idea
      await api.ideas.update(ideaId, {
        name: editedTitle,
      });

      // Update local state
      setIdea({ ...idea, title: editedTitle });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating idea title:", error);
      // Reset to original title
      setEditedTitle(idea.title);
      setIsEditingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar active="Ideas" />
        <main className="flex-1 flex flex-row min-h-screen ml-16 sm:ml-64 transition-all duration-300">
          <section className="w-full flex justify-center items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
              <div className="h-40 bg-gray-200 rounded w-full max-w-2xl mb-4"></div>
              <div className="h-40 bg-gray-200 rounded w-full max-w-2xl mb-4"></div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar active="Ideas" />
        <main className="flex-1 flex flex-row min-h-screen ml-16 sm:ml-64 transition-all duration-300">
          <section className="w-full flex flex-col justify-center items-center p-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200 max-w-md w-full">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Error Loading Idea
              </h2>
              <div className="text-neutral-700 mb-6">
                {error || "Idea not found. Please try again."}
              </div>
              {error && error.includes("not found") && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                  <p className="font-medium mb-2">🔍 Possible Causes:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>The idea ID in the URL might be incorrect</li>
                    <li>The idea might have been deleted</li>
                    <li>You might not have permission to view this idea</li>
                  </ul>
                </div>
              )}
              {error && error.includes("connect") && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                  <p className="font-medium mb-2">🌐 Connection Issues:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Check if the backend server is running</li>
                    <li>Ensure your internet connection is active</li>
                    <li>The API server might be temporarily down</li>
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex-1"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>

                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 w-full"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      // Create a demo idea
                      const newIdea = await api.ideas.create({
                        name: "My Demo Idea",
                        category: "Demo Category",
                        tags: ["demo", "example"],
                      });
                      console.log("Created demo idea:", newIdea);

                      // Navigate to the new idea
                      router.push(`/dashboard/idea/${newIdea.id}`);
                    } catch (error) {
                      console.error("Error creating demo idea:", error);
                      setError(
                        "Failed to create demo idea. Please try again or check your connection."
                      );
                      setLoading(false);
                    }
                  }}
                >
                  Create Demo Idea
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar active="Ideas" />

      {/* Main Workspace Split Pane */}
      <main className="flex-1 flex flex-row min-h-screen ml-16 sm:ml-64 transition-all duration-300">
        {/* Left Pane: Idea details, tabs, clips, add clip */}
        <section className="w-full md:w-1/2 xl:w-2/3 flex flex-col items-center px-2 sm:px-8 py-8">
          <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-neutral-200">
            {/* Enhanced Header with Add Clip */}
            <div className="mb-10 bg-gradient-to-r from-orange-50 via-white to-blue-50 rounded-2xl p-8 border border-neutral-200 shadow flex flex-col gap-6">
              {/* Header row: title, description, tags, actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingTitle ? (
                      <input
                        className="text-4xl font-extrabold tracking-tight text-neutral-900 bg-white border border-orange-200 rounded px-2 py-1"
                        value={editedTitle}
                        autoFocus
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleUpdateTitle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateTitle();
                          } else if (e.key === "Escape") {
                            setIsEditingTitle(false);
                            setEditedTitle(idea.title);
                          }
                        }}
                      />
                    ) : (
                      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-0">
                        {idea.title}
                        <button
                          className="ml-2 text-orange-500 hover:text-orange-700 text-xl"
                          title="Edit title"
                          onClick={() => {
                            setIsEditingTitle(true);
                            setEditedTitle(idea.title);
                          }}
                        >
                          ✏️
                        </button>
                      </h1>
                    )}
                  </div>
                  <div className="text-neutral-500 text-lg mb-2">
                    {idea.description}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    {idea.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded bg-neutral-100 text-neutral-700 font-medium border border-neutral-200"
                      >
                        #{tag}
                      </span>
                    ))}
                    <button
                      className="ml-2 px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs border border-orange-200 hover:bg-orange-200"
                      title="Add tag"
                      onClick={() => setShowTagInput(true)}
                    >
                      +
                    </button>
                    {showTagInput && (
                      <input
                        className="ml-2 px-2 py-1 rounded border border-neutral-200 text-xs"
                        placeholder="New tag"
                        value={newTag}
                        autoFocus
                        onChange={(e) => setNewTag(e.target.value)}
                        onBlur={() => {
                          setShowTagInput(false);
                          if (newTag.trim()) {
                            setIdea({
                              ...idea!,
                              tags: [...idea!.tags, newTag.trim()],
                            });
                            setNewTag("");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setShowTagInput(false);
                            if (newTag.trim()) {
                              setIdea({
                                ...idea!,
                                tags: [...idea!.tags, newTag.trim()],
                              });
                              setNewTag("");
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                {/* Actions dropdown */}
                <div className="relative flex gap-2 mt-2 md:mt-0">
                  <div className="group">
                    <button className="flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      <span className="hidden sm:inline">Organize Clips</span>
                    </button>
                    <div className="absolute right-0 mt-0 z-10 hidden group-hover:block bg-white border border-orange-200 rounded shadow-xl min-w-[180px]">
                      <button
                        className="w-full text-left px-4 py-2 bg-white hover:bg-orange-100 text-neutral-700 flex items-center gap-2 rounded-t-xl transition whitespace-nowrap"
                        title="Edit Idea"
                      >
                        <span className="text-lg">✏️</span> Edit Idea
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 bg-white hover:bg-red-50 text-red-600 flex items-center gap-2 transition whitespace-nowrap"
                        title="Delete Idea"
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this idea?"
                            )
                          ) {
                            try {
                              await api.ideas.delete(ideaId);
                              router.push("/dashboard");
                            } catch (error) {
                              console.error("Error deleting idea:", error);
                            }
                          }
                        }}
                      >
                        <span className="text-lg">🗑️</span> Delete Idea
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 bg-white hover:bg-orange-50 text-orange-600 flex items-center gap-2 rounded-b-xl transition whitespace-nowrap"
                        title="Generate Final Content"
                      >
                        <span className="text-lg">🤖</span> Generate Final
                        Content
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Clip section in header - replaced with a simplified indicator */}
              <div className="text-center py-3 bg-orange-50 rounded-xl border border-orange-100 shadow-sm flex items-center justify-center gap-2">
                <span className="text-orange-600">
                  Add clips to organize your ideas
                </span>
                <button
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  onClick={() => setShowAddClipModal(true)}
                >
                  Open Clip Editor
                </button>
              </div>

              <div className="text-xs text-neutral-400 mt-2">
                Tip: Use the + button in the corner to quickly add a clip.
              </div>
            </div>

            {/* Tabs and Clips */}
            <div className="mb-8">
              <nav className="flex gap-2 border-b border-neutral-200 pb-2 mb-4 overflow-x-auto">
                {contentTypes.map((tab) => (
                  <button
                    key={tab.value}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                      activeTab === tab.value
                        ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500"
                        : "hover:bg-neutral-100 text-neutral-500"
                    }`}
                    onClick={() => setActiveTab(tab.value as "all" | ClipType)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <section>
                {filteredClips.length === 0 ? (
                  <div className="text-neutral-400 text-center py-8">
                    No clips yet. Add your first clip!
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {(
                      ["text", "image", "link", "code", "video"] as ClipType[]
                    ).map((type) => (
                      <ClipSection
                        key={type}
                        type={type}
                        clips={filteredClips}
                        selectedClipId={selectedClipId}
                        onClipEdit={setSelectedClipId}
                        onClipDelete={handleDeleteClip}
                        onClipContentChange={handleClipContentChange}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        {/* Right Pane: AI/content editor area */}
        <aside className="hidden md:flex flex-col w-1/2 xl:w-1/3 border-l border-neutral-200 bg-white/80 backdrop-blur-lg p-8 min-h-screen">
          <ContentWorkspace idea={idea} clips={clips} />
        </aside>
      </main>

      {/* Modal for clip preview/edit */}
      {selectedClipId && (
        <ClipModal
          clip={clips.find((c) => c.id === selectedClipId)!}
          onClose={() => setSelectedClipId(null)}
        />
      )}

      {/* Floating action button for adding clips */}
      <FloatingActionButton onClick={() => setShowAddClipModal(true)} />

      {/* Modal for adding a new clip */}
      {showAddClipModal && (
        <AddClipModal
          contentTypes={contentTypes.filter((t) => t.value !== "all")}
          onAddClip={handleAddClip}
          onClose={() => setShowAddClipModal(false)}
        />
      )}
    </div>
  );
}
