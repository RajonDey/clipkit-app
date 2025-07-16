import React, { useState } from "react";
import Image from "next/image";
import { ClipType, ContentTypeOption } from "@/types/idea";
import { buttonStyles, inputStyles } from "@/styles/tokens";

interface AddClipModalProps {
  contentTypes: ContentTypeOption[];
  onAddClip: (type: ClipType, content: string, tag: string) => void;
  onClose: () => void;
}

/**
 * Modal component for adding a new clip with tabs for different content types
 */
export const AddClipModal: React.FC<AddClipModalProps> = ({
  contentTypes,
  onAddClip,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ClipType>("text");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("js");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let finalContent = content;

    // For code clips, we might want to store the language info
    if (activeTab === "code") {
      // You could either append the language to the content or handle it differently
      // This is a simple approach for now
      finalContent = content;
    }

    onAddClip(activeTab, finalContent, tag);
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "text":
        return (
          <textarea
            className={`${inputStyles.default} ${inputStyles.focus} ${inputStyles.textArea} w-full`}
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        );
      case "link":
        return (
          <input
            type="url"
            className={`${inputStyles.default} ${inputStyles.focus} w-full`}
            placeholder="https://..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        );
      case "image":
        return (
          <div className="space-y-4">
            <input
              type="url"
              className={`${inputStyles.default} ${inputStyles.focus} w-full`}
              placeholder="https://... (image URL)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {content && (
              <div className="mt-2 border rounded overflow-hidden max-h-40 flex items-center justify-center relative">
                <div
                  style={{
                    height: "160px",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <Image
                    src={content}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                    onError={() => {
                      // Handle error by showing fallback image if needed
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <input
            type="url"
            className={`${inputStyles.default} ${inputStyles.focus} w-full`}
            placeholder="https://... (video URL)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        );
      case "code":
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center mb-2">
              <label className="text-sm text-neutral-500">Language:</label>
              <select
                className="border border-neutral-200 rounded px-2 py-1 text-sm bg-white"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="js">JavaScript</option>
                <option value="ts">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell/Bash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <textarea
              className={`${inputStyles.default} ${inputStyles.focus} ${inputStyles.textArea} w-full font-mono text-sm`}
              placeholder="Paste or type your code here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              rows={8}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-neutral-200 relative">
        <button
          className="absolute top-3 right-3 text-neutral-400 hover:text-orange-500 text-2xl"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-neutral-800">
          Add New Clip
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 text-sm transition-all ${
                activeTab === type.value
                  ? `bg-${
                      type.value === "text"
                        ? "orange"
                        : type.value === "image"
                        ? "blue"
                        : type.value === "video"
                        ? "purple"
                        : type.value === "code"
                        ? "neutral"
                        : "yellow"
                    }-100 text-${
                      type.value === "text"
                        ? "orange"
                        : type.value === "image"
                        ? "blue"
                        : type.value === "video"
                        ? "purple"
                        : type.value === "code"
                        ? "neutral"
                        : "yellow"
                    }-700 border-b-2 border-${
                      type.value === "text"
                        ? "orange"
                        : type.value === "image"
                        ? "blue"
                        : type.value === "video"
                        ? "purple"
                        : type.value === "code"
                        ? "neutral"
                        : "yellow"
                    }-500`
                  : "hover:bg-neutral-100 text-neutral-500"
              }`}
              onClick={() => setActiveTab(type.value as ClipType)}
            >
              <span>
                {type.value === "text" && "📝"}
                {type.value === "link" && "🔗"}
                {type.value === "image" && "🖼️"}
                {type.value === "video" && "🎬"}
                {type.value === "code" && "💻"}
              </span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderTabContent()}

          <div className="flex gap-2 items-center">
            <input
              className={`${inputStyles.default} ${inputStyles.focus}`}
              placeholder="Tag (optional)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className={buttonStyles.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${buttonStyles.primary} flex items-center gap-2`}
            >
              <span className="text-lg">➕</span> Add Clip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
