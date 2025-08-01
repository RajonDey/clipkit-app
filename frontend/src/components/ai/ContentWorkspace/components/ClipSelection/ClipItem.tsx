import React from "react";
import { Clip } from "@/types/idea";

interface ClipItemProps {
  clip: Clip;
  isSelected: boolean;
  isDragged: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onToggleSelection: () => void;
  onPreview: () => void;
}

const ClipItem: React.FC<ClipItemProps> = ({
  clip,
  isSelected,
  isDragged,
  onDragStart,
  onDragOver,
  onDragEnd,
  onToggleSelection,
  onPreview,
}) => {
  return (
    <div
      className={`flex items-center p-2 rounded-md cursor-pointer transition ${
        isSelected
          ? "bg-blue-50 border border-blue-200"
          : "bg-white border border-neutral-200 hover:bg-neutral-100"
      } ${isDragged ? "opacity-50" : ""}`}
      onClick={onToggleSelection}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
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
          checked={isSelected}
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
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
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
  );
};

export default ClipItem;
