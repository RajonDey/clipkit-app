"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

// Sidebar links are now defined in the Sidebar component

// Placeholder ideas data
const initialIdeas = [
  {
    id: 1,
    title: "My First Article Idea",
    description: "A creative article about productivity hacks for creators.",
    tags: ["productivity", "creativity"],
    clips: [
      { id: 1, type: "text", content: "Clip: Top 5 productivity tools." },
      { id: 2, type: "link", content: "https://zenhabits.net/" },
    ],
  },
  {
    id: 2,
    title: "YouTube Script: AI Tools Review",
    description: "A video script reviewing the best AI tools for 2025.",
    tags: ["video", "ai", "review"],
    clips: [
      { id: 1, type: "text", content: "Intro: Why AI tools matter." },
      {
        id: 2,
        type: "image",
        content: "https://source.unsplash.com/random/200x100",
      },
    ],
  },
];

export default function DashboardPage() {
  const [active, setActive] = useState("Ideas");
  const [ideas, setIdeas] = useState(initialIdeas);
  const [showModal, setShowModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const router = useRouter();

  // Handlers
  const openNewIdea = () => {
    setEditingIdea(null);
    setShowModal(true);
  };
  // Change: Instead of opening modal, navigate to workspace page
  const openEditIdea = (idea: any) => {
    router.push(`/dashboard/idea/${idea.id}`);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingIdea(null);
  };
  const saveIdea = (idea: any) => {
    if (idea.id) {
      setIdeas(ideas.map((i) => (i.id === idea.id ? idea : i)));
    } else {
      setIdeas([...ideas, { ...idea, id: Date.now(), clips: [] }]);
    }
    closeModal();
  };

  // Main content for Ideas
  const renderIdeas = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Add New Idea Card */}
      <Button
        onClick={openNewIdea}
        variant="primary"
        size="lg"
        className="flex flex-col items-center justify-center border-2 border-dashed border-orange-200 rounded-2xl p-8 h-56 bg-white text-orange-600 hover:bg-orange-50 transition-all cursor-pointer shadow-md group relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-orange-400 to-orange-200 opacity-70 group-hover:opacity-100 transition-all rounded-l-2xl" />
        <div className="bg-white rounded-full p-3 mb-3 shadow-sm z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-500"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
        <span className="font-semibold text-lg z-10">Start a New Idea</span>
        <span className="text-xs mt-2 text-orange-400 z-10">
          Collect, organize, and create!
        </span>
      </Button>
      {/* Idea Cards */}
      {ideas.map((idea) => (
        <motion.div
          key={idea.id}
          whileHover={{ y: -6, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.10)" }}
          className="relative flex flex-col rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-neutral-200 hover:border-orange-300 group overflow-hidden"
          onClick={() => openEditIdea(idea)}
        >
          {/* Vertical accent bar */}
          <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-orange-400 to-orange-200 opacity-70 group-hover:opacity-100 transition-all rounded-l-2xl" />
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {idea.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded bg-neutral-100 text-neutral-700 font-medium border border-neutral-200"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h2 className="font-bold text-xl mb-1 text-neutral-900 truncate">
            {idea.title}
          </h2>
          <p className="text-neutral-500 text-sm mb-3 line-clamp-2">
            {idea.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {idea.clips.slice(0, 2).map((clip: any) => (
              <span
                key={clip.id}
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-neutral-50 text-neutral-700 gap-1 border border-neutral-200"
              >
                {clip.type === "text" && (
                  <svg
                    className="w-3 h-3 text-orange-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M9 9h1" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                  </svg>
                )}
                {clip.type === "link" && (
                  <svg
                    className="w-3 h-3 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )}
                {clip.type === "image" && (
                  <svg
                    className="w-3 h-3 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                )}
                <span>
                  {clip.content.length > 20
                    ? clip.content.slice(0, 20) + "..."
                    : clip.content}
                </span>
              </span>
            ))}
            {idea.clips.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-orange-50 text-orange-500 border border-orange-100">
                +{idea.clips.length - 2} more
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-50 via-yellow-50 to-white">
      {/* Sidebar */}
      <Sidebar active={active} />
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 ml-16 sm:ml-64 transition-all duration-300">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-900 via-yellow-700 to-blue-700">
            {active}
          </h1>
          {active === "Ideas" && (
            <Button
              onClick={openNewIdea}
              size="md"
              className="shadow-md bg-gradient-to-r from-orange-400 to-yellow-300 hover:from-orange-500 hover:to-yellow-400"
            >
              + New Idea
            </Button>
          )}
        </header>
        <section className="flex-1">
          {active === "Ideas" ? (
            renderIdeas()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-blue-400">
              <span className="text-5xl mb-4">🚧</span>
              <p className="text-lg">{active} section coming soon!</p>
            </div>
          )}
        </section>
      </main>

      {/* Idea Workspace Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              <IdeaWorkspace
                idea={editingIdea}
                onSave={saveIdea}
                onCancel={closeModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Idea Workspace Modal Component ---
function IdeaWorkspace({ idea, onSave, onCancel }: any) {
  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [tags, setTags] = useState<string[]>(idea?.tags || []);
  const [clips, setClips] = useState<any[]>(idea?.clips || []);
  const [newClip, setNewClip] = useState("");
  const [clipType, setClipType] = useState("text");
  const [tagInput, setTagInput] = useState("");
  const [codeLang, setCodeLang] = useState("js");
  const contentTypes = [
    { value: "text", label: "Text", icon: "Text" },
    { value: "image", label: "Image", icon: "Image" },
    { value: "video", label: "Video", icon: "Video" },
    { value: "code", label: "Code", icon: "Code" },
    { value: "link", label: "Link", icon: "Link" },
  ];
  const codeLangs = [
    { value: "js", label: "JavaScript" },
    { value: "py", label: "Python" },
    { value: "ts", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "md", label: "Markdown" },
  ];

  const addClip = () => {
    if (!newClip.trim()) return;
    setClips([
      ...clips,
      {
        id: Date.now(),
        type: clipType,
        content: newClip,
        lang: clipType === "code" ? codeLang : undefined,
      },
    ]);
    setNewClip("");
  };
  const removeClip = (id: number) => setClips(clips.filter((c) => c.id !== id));
  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: idea?.id,
      title,
      description,
      tags,
      clips,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <input
          className="flex-1 text-2xl font-bold border-0 border-b-2 border-neutral-200 focus:border-orange-400 outline-none bg-transparent transition-all shadow-none"
          placeholder="Idea Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
          className="text-neutral-600 border border-neutral-200 bg-white hover:bg-neutral-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          size="sm"
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          Save
        </Button>
      </div>
      <textarea
        className="w-full min-h-[60px] border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all bg-white text-neutral-900 shadow-sm"
        placeholder="Describe your idea..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* Tags */}
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs rounded-md bg-neutral-100 text-neutral-700 font-medium flex items-center gap-1 shadow-sm border border-neutral-200"
          >
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 text-neutral-400 hover:text-orange-500 rounded-full hover:bg-orange-100 w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="px-2 py-1 text-xs border border-neutral-200 rounded-md bg-white focus:ring-1 focus:ring-orange-200 focus:border-orange-400 outline-none ml-2 shadow-sm"
          placeholder="Add tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" ? (addTag(), e.preventDefault()) : undefined
          }
        />
        <Button
          onClick={addTag}
          variant="secondary"
          size="sm"
          className="text-xs px-2 py-0 h-6 rounded-md text-orange-600 border border-neutral-200 bg-white hover:bg-orange-50"
        >
          Add
        </Button>
      </div>
      {/* Clips */}
      <div>
        <div className="mb-2 font-semibold text-neutral-800">Clips</div>
        <div className="flex gap-2 mb-4 items-center">
          <select
            className="border border-neutral-200 rounded-md px-2 py-1 text-sm bg-white text-neutral-800 focus:ring-1 focus:ring-orange-200 focus:border-orange-400 outline-none shadow-sm"
            value={clipType}
            onChange={(e) => setClipType(e.target.value)}
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          {clipType === "code" && (
            <select
              className="border border-neutral-200 rounded-md px-2 py-1 text-sm bg-white text-neutral-800 focus:ring-1 focus:ring-orange-200 focus:border-orange-400 outline-none shadow-sm"
              value={codeLang}
              onChange={(e) => setCodeLang(e.target.value)}
            >
              {codeLangs.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          )}
          <input
            className="flex-1 px-3 py-1 border border-neutral-200 rounded-md focus:ring-1 focus:ring-orange-200 focus:border-orange-400 outline-none bg-white shadow-sm"
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
            onKeyDown={(e) =>
              e.key === "Enter" ? (addClip(), e.preventDefault()) : undefined
            }
          />
          <Button
            onClick={addClip}
            variant="secondary"
            size="sm"
            className="px-4 py-1 bg-orange-500 text-white hover:bg-orange-600 shadow-md"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {clips.length === 0 && (
            <div className="text-neutral-400 text-sm">
              No clips yet. Add your first!
            </div>
          )}
          {clips.map((clip) => (
            <div
              key={clip.id}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all shadow-md border border-neutral-200 bg-white`}
            >
              <span className="text-lg">
                {clip.type === "text" && (
                  <svg
                    className="w-5 h-5 text-orange-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M9 9h1" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                  </svg>
                )}
                {clip.type === "link" && (
                  <svg
                    className="w-5 h-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )}
                {clip.type === "image" && (
                  <svg
                    className="w-5 h-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                )}
                {clip.type === "video" && (
                  <svg
                    className="w-5 h-5 text-orange-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                )}
                {clip.type === "code" && (
                  <svg
                    className="w-5 h-5 text-blue-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                )}
              </span>
              <span
                className={`flex-1 text-sm break-all ${
                  clip.type === "code" ? "text-blue-200 font-mono" : ""
                }`}
              >
                {clip.type === "image" ? (
                  <img
                    src={clip.content}
                    alt="clip"
                    className="h-12 rounded shadow"
                  />
                ) : clip.type === "video" ? (
                  <video
                    src={clip.content}
                    controls
                    className="h-12 rounded shadow bg-black"
                  />
                ) : clip.type === "code" ? (
                  <pre className="overflow-x-auto text-xs p-2 rounded bg-brand-900/80">
                    <code>{clip.content}</code>
                  </pre>
                ) : clip.type === "link" ? (
                  <a
                    href={clip.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-accent-600 hover:text-accent-800"
                  >
                    {clip.content}
                  </a>
                ) : (
                  clip.content
                )}
              </span>
              {clip.type === "code" && clip.lang && (
                <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-800 text-blue-200 font-mono uppercase">
                  {clip.lang}
                </span>
              )}
              <button
                onClick={() => removeClip(clip.id)}
                className="text-blue-400 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-all"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Future: Mark as Ready for Creation */}
      <div className="flex justify-end mt-4">
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1 shadow-md text-blue-700"
        >
          <svg
            className="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Mark as Ready for Creation
        </Button>
      </div>
    </div>
  );
}
