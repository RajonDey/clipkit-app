// Dedicated workspace page for an idea. Will fetch idea and clips by ID, display header, tabs for content types, and list of clips.
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

// Dummy data for mockup (replace with API fetch)
const mockIdeas = [
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

const contentTypes = [
  { value: "all", label: "All" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "code", label: "Code" },
  { value: "link", label: "Link" },
];

const IdeaWorkspacePage = () => {
  const params = useParams();
  const router = useRouter();
  const ideaId = params?.id || "1";
  const [idea, setIdea] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [newClip, setNewClip] = useState("");
  const [clipType, setClipType] = useState("text");
  const [clipTag, setClipTag] = useState("");
  const [clips, setClips] = useState<any[]>([]);

  useEffect(() => {
    // Replace with API fetch
    const found = mockIdeas.find((i) => i.id === ideaId);
    setIdea(found);
    setClips(found ? found.clips : []);
  }, [ideaId]);

  const filteredClips =
    activeTab === "all" ? clips : clips.filter((c) => c.type === activeTab);

  const handleAddClip = () => {
    if (!newClip.trim()) return;
    const newClipObj = {
      id: Date.now(),
      type: clipType,
      content: newClip,
      created: new Date().toISOString().slice(0, 10),
      tags: clipTag ? [clipTag] : [],
    };
    setClips([newClipObj, ...clips]);
    setNewClip("");
    setClipTag("");
  };

  if (!idea)
    return <div className="text-center text-gray-400 mt-20">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-brand-50 to-brand-100">
      {/* Sidebar */}
      <Sidebar active="Ideas" />
      {/* Main Workspace */}
      <main className="flex-1 flex flex-col items-center px-2 sm:px-8 py-8 bg-gradient-to-br from-brand-50 to-brand-100 min-h-screen ml-16 sm:ml-64 transition-all duration-300">
        <div className="w-full mx-auto bg-white/90 rounded-2xl shadow-xl p-6 sm:p-10 border border-brand-100">
          {/* Notion-style doc header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-brand-900">
              {idea.title}
            </h1>
            <div className="text-brand-500 mb-2 text-lg">
              {idea.description}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {idea.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded bg-accent-100 text-accent-700 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 rounded bg-brand-100 hover:bg-brand-200 text-brand-700">
                Edit
              </button>
              <button className="px-4 py-2 rounded bg-secondary-700 hover:bg-secondary-600 text-white">
                Delete
              </button>
              <button className="px-4 py-2 rounded bg-gradient-to-r from-accent-600 to-secondary-600 hover:from-accent-500 hover:to-secondary-500 text-white">
                Generate AI
              </button>
            </div>
          </div>
          {/* Notion-style doc body: organized by content type, but simple and clean */}
          <div className="mb-8">
            <nav className="flex gap-2 border-b border-brand-200 pb-2 mb-4 overflow-x-auto">
              {contentTypes.map((tab) => (
                <button
                  key={tab.value}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                    activeTab === tab.value
                      ? "bg-brand-100 text-accent-700"
                      : "hover:bg-brand-100 text-brand-500"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <section>
              {filteredClips.length === 0 ? (
                <div className="text-brand-400 text-center py-8">
                  No clips yet. Add your first clip!
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredClips.map((clip) => (
                    <div
                      key={clip.id}
                      className="group relative flex gap-4 items-start p-4 rounded-xl hover:bg-brand-50 transition-all border border-brand-100"
                    >
                      <span className="text-2xl mt-1">
                        {clip.type === "text" && "📝"}
                        {clip.type === "link" && "🔗"}
                        {clip.type === "image" && "🖼️"}
                        {clip.type === "video" && "🎬"}
                        {clip.type === "code" && "💻"}
                      </span>
                      <div className="flex-1 min-w-0">
                        {clip.type === "image" ? (
                          <img
                            src={clip.content}
                            alt="clip"
                            className="h-24 rounded shadow"
                          />
                        ) : clip.type === "video" ? (
                          <video
                            src={clip.content}
                            controls
                            className="h-24 rounded shadow bg-black"
                          />
                        ) : clip.type === "code" ? (
                          <pre className="overflow-x-auto text-xs p-2 rounded bg-brand-900 text-green-200 font-mono">
                            <code>{clip.content}</code>
                          </pre>
                        ) : clip.type === "link" ? (
                          <a
                            href={clip.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-accent-600 hover:text-accent-800 break-all"
                          >
                            {clip.content}
                          </a>
                        ) : (
                          <div className="whitespace-pre-line text-brand-800 text-base">
                            {clip.content}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {clip.tags &&
                            clip.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded bg-accent-50 text-accent-700"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                        <span className="text-xs text-brand-400 mt-1 block">
                          {clip.created}
                        </span>
                      </div>
                      <button className="ml-2 text-secondary-400 hover:text-secondary-700 text-lg absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
          {/* Add Clip section (Notion-style, subtle) */}
          <section className="mt-10">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <select
                className="border rounded px-2 py-2 text-sm text-brand-900"
                value={clipType}
                onChange={(e) => setClipType(e.target.value)}
              >
                {contentTypes
                  .filter((t) => t.value !== "all")
                  .map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
              </select>
              <input
                className="flex-1 px-3 py-2 border rounded text-brand-900"
                placeholder={
                  clipType === "text"
                    ? "Add a note..."
                    : clipType === "link"
                    ? "Paste a link..."
                    : clipType === "image"
                    ? "Paste image URL..."
                    : clipType === "video"
                    ? "Paste video URL (YouTube, etc)..."
                    : clipType === "code"
                    ? "Paste code snippet..."
                    : ""
                }
                value={newClip}
                onChange={(e) => setNewClip(e.target.value)}
              />
              <input
                className="px-2 py-2 border rounded text-brand-900"
                placeholder="Tag (optional)"
                value={clipTag}
                onChange={(e) => setClipTag(e.target.value)}
              />
              <button
                onClick={handleAddClip}
                className="px-4 py-2 rounded bg-gradient-to-r from-accent-600 to-secondary-600 text-white font-medium hover:from-accent-500 hover:to-secondary-500 transition-all"
              >
                Add
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default IdeaWorkspacePage;
