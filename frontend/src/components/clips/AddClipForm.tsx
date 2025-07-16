import React, { useState } from "react";
import { ClipType, ContentTypeOption } from "@/types/idea";
import { buttonStyles } from "@/styles/tokens";

interface AddClipFormProps {
  contentTypes: ContentTypeOption[];
  onAddClip: (type: ClipType, content: string, tag: string) => void;
}

/**
 * Form component for adding a new clip
 */
export const AddClipForm: React.FC<AddClipFormProps> = ({
  contentTypes,
  onAddClip,
}) => {
  const [clipType, setClipType] = useState<ClipType>("text");
  const [newClip, setNewClip] = useState("");
  const [clipTag, setClipTag] = useState("");

  const handleAddClip = () => {
    if (!newClip.trim()) return;
    onAddClip(clipType, newClip, clipTag);
    setNewClip("");
    setClipTag("");
  };

  const getPlaceholder = () => {
    switch (clipType) {
      case "text":
        return "Add a note...";
      case "link":
        return "Paste a link...";
      case "image":
        return "Paste image URL...";
      case "video":
        return "Paste video URL (YouTube, etc)...";
      case "code":
        return "Paste code snippet...";
      default:
        return "Add content...";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center bg-white/80 rounded-xl p-4 border border-neutral-100 shadow-sm">
      <select
        className="border border-neutral-200 rounded px-2 py-2 text-sm text-neutral-900 bg-white flex items-center"
        value={clipType}
        onChange={(e) => setClipType(e.target.value as ClipType)}
      >
        {contentTypes
          .filter((t) => t.value !== "all")
          .map((type) => {
            const icons: Record<string, string> = {
              text: "📝",
              image: "🖼️",
              video: "🎬",
              code: "💻",
              link: "🔗",
            };
            return (
              <option key={type.value} value={type.value}>
                {icons[type.value]} {type.label}
              </option>
            );
          })}
      </select>

      <input
        className="flex-1 px-3 py-2 border border-neutral-200 rounded text-neutral-900 bg-white"
        placeholder={getPlaceholder()}
        value={newClip}
        onChange={(e) => setNewClip(e.target.value)}
      />

      <input
        className="px-2 py-2 border border-neutral-200 rounded text-neutral-900 bg-white"
        placeholder="Tag (optional)"
        value={clipTag}
        onChange={(e) => setClipTag(e.target.value)}
      />

      <button
        onClick={handleAddClip}
        className={`${buttonStyles.primary} flex items-center gap-2`}
        title="Add Clip (Ctrl+Enter)"
      >
        <span className="text-lg">➕</span> Add
      </button>
    </div>
  );
};
