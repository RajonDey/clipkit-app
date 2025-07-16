"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Idea, Clip, ClipType, ContentTypeOption } from "@/types/idea";
import { ClipModal } from "@/components/clips/ClipModal";
import { ClipSection } from "@/components/clips/ClipSection";
import { AddClipForm } from "@/components/clips/AddClipForm";
import { buttonStyles, clipTypeStyles } from "@/styles/tokens";

// Dummy data for mockup (replace with API fetch)
const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "My First Article Idea",
    description: "A creative article about productivity hacks for creators.",
    tags: ["productivity", "creativity"],
    clips: [
      {
        id: 1,
        type: "text",
        content: "Clip: Top 5 productivity tools.",
        created: "2025-07-10",
        tags: ["tip"],
      },
      {
        id: 2,
        type: "link",
        content: "https://zenhabits.net/",
        created: "2025-07-10",
        tags: ["resource"],
      },
      {
        id: 3,
        type: "image",
        content: "https://source.unsplash.com/random/200x100",
        created: "2025-07-10",
        tags: [],
      },
      {
        id: 4,
        type: "code",
        content: "console.log('Hello!')",
        lang: "js",
        created: "2025-07-10",
        tags: ["snippet"],
      },
    ],
  },
];

const contentTypes: ContentTypeOption[] = [
  { value: "all", label: "All" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "code", label: "Code" },
  { value: "link", label: "Link" },
];

/**
 * Dedicated workspace page for an idea
 * Displays idea details, clips, and manages adding/editing/deleting clips
 */
const IdeaWorkspacePage = () => {
  const params = useParams();
  const ideaId = (params?.id as string) || "1";
  const [idea, setIdea] = useState<Idea | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | ClipType>("all");
  const [clips, setClips] = useState<Clip[]>([]);

  // Editable title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Add tag
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Modal for previewing/editing a clip
  const [selectedClipId, setSelectedClipId] = useState<number | null>(null);

  useEffect(() => {
    // Replace with API fetch
    const found = mockIdeas.find((i) => i.id === ideaId);
    setIdea(found || null);
    setClips(found ? found.clips : []);
  }, [ideaId]);

  /**
   * Filters clips based on the active tab
   */
  const filteredClips =
    activeTab === "all" ? clips : clips.filter((c) => c.type === activeTab);

  /**
   * Handles adding a new clip to the collection
   */
  const handleAddClip = (type: ClipType, content: string, tag: string) => {
    if (!content.trim()) return;
    const newClipObj: Clip = {
      id: Date.now(),
      type,
      content,
      created: new Date().toISOString().slice(0, 10),
      tags: tag ? [tag] : [],
    };
    setClips([newClipObj, ...clips]);
  };

  /**
   * Updates the content of a clip
   */
  const handleClipContentChange = (clipId: number, content: string) => {
    setClips(clips.map((c) => (c.id === clipId ? { ...c, content } : c)));
  };

  /**
   * Deletes a clip
   */
  const handleDeleteClip = (clipId: number) => {
    setClips(clips.filter((c) => c.id !== clipId));
  };

  if (!idea)
    return <div className="text-center text-gray-400 mt-20">Loading...</div>;

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
                        onBlur={() => {
                          setIsEditingTitle(false);
                          if (editedTitle.trim()) {
                            setIdea({ ...idea!, title: editedTitle });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsEditingTitle(false);
                            if (editedTitle.trim()) {
                              setIdea({ ...idea!, title: editedTitle });
                            }
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
                    <button
                      className={
                        buttonStyles.outline + " flex items-center gap-2"
                      }
                    >
                      <span className="text-lg">⚙️</span>
                      <span className="hidden sm:inline">Actions</span>
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
                      >
                        <span className="text-lg">🗑️</span> Delete Idea
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 bg-white hover:bg-orange-50 text-orange-600 flex items-center gap-2 rounded-b-xl transition whitespace-nowrap"
                        title="Generate Content with AI"
                      >
                        <span className="text-lg">🤖</span> Generate Content
                        with AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Clip section in header */}
              <AddClipForm
                contentTypes={contentTypes.filter((t) => t.value !== "all")}
                onAddClip={handleAddClip}
              />

              <div className="text-xs text-neutral-400 mt-2">
                Tip: Use <kbd>Ctrl+Enter</kbd> to quickly add a clip.
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
          <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
            <span className="text-2xl mb-2">🤖</span>
            <div className="text-lg font-medium mb-2">
              AI Content Workspace (Coming Soon)
            </div>
            <div className="text-sm text-neutral-400 text-center">
              Use your collected resources to generate articles, scripts, or
              other content with AI assistance here.
            </div>
          </div>
        </aside>
      </main>

      {/* Modal for clip preview/edit */}
      {selectedClipId && (
        <ClipModal
          clip={clips.find((c) => c.id === selectedClipId)!}
          onClose={() => setSelectedClipId(null)}
        />
      )}
    </div>
  );
};

export default IdeaWorkspacePage;
