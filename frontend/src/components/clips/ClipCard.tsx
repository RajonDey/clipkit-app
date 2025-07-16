import React from "react";
import Image from "next/image";
import { Clip } from "@/types/idea";

interface ClipCardProps {
  clip: Clip;
  onEdit: (clipId: number) => void;
  onDelete: (clipId: number) => void;
  onContentChange?: (clipId: number, content: string) => void;
  isEditing: boolean;
}

/**
 * Renders a card for a single clip with appropriate display based on clip type
 */
export const ClipCard: React.FC<ClipCardProps> = ({
  clip,
  onEdit,
  onDelete,
  onContentChange,
  isEditing,
}) => {
  const handleClipContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (onContentChange) {
      onContentChange(clip.id, e.target.value);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this clip?")) {
      onDelete(clip.id);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(clip.content);
    // Show toast
    const toast = document.createElement("div");
    toast.textContent = "Copied!";
    toast.className =
      "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow z-50 animate-fadein";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 1200);
  };

  const renderClipContent = () => {
    if (clip.type === "text") {
      return (
        <textarea
          className="w-full min-h-[80px] max-h-[320px] p-4 rounded-xl border-2 border-orange-100 focus:border-orange-400 bg-white text-neutral-900 text-base leading-relaxed font-serif shadow transition-all resize-vertical hover:border-orange-200 focus:outline-none"
          value={clip.content}
          placeholder="Write your note..."
          onChange={handleClipContentChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      );
    }

    if (clip.type === "code" && isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full p-2 rounded border border-orange-200 bg-neutral-50 text-base font-mono"
            value={clip.content}
            autoFocus
            onChange={handleClipContentChange}
          />
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-orange-500 text-white font-bold hover:bg-orange-600"
              title="Save"
              onClick={() => onEdit(0)} // Pass 0 to deselect
            >
              Save
            </button>
            <button
              className="px-3 py-1 rounded bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              title="Cancel"
              onClick={() => onEdit(0)} // Pass 0 to deselect
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (clip.type === "image") {
      return (
        <div className="w-full h-auto">
          <Image
            src={clip.content}
            alt="clip"
            width={800}
            height={400}
            className="object-cover rounded shadow"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={false}
          />
        </div>
      );
    }

    if (clip.type === "video") {
      return (
        <div className="relative aspect-w-16 aspect-h-9">
          <video
            src={clip.content}
            controls
            className="w-full h-full rounded shadow bg-black object-contain"
          />
          <div className="absolute inset-0 hidden group-hover/video:flex items-center justify-center bg-black/30 rounded">
            <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">
              Preview
            </span>
          </div>
        </div>
      );
    }

    if (clip.type === "code") {
      return (
        <pre className="overflow-x-auto text-xs p-2 rounded bg-neutral-900 text-orange-200 font-mono">
          <code>{clip.content}</code>
        </pre>
      );
    }

    if (clip.type === "link") {
      return (
        <div className="relative group/link">
          <a
            href={clip.content}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-600 hover:text-orange-800 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {clip.content}
          </a>
          <div className="absolute inset-0 hidden group-hover/link:flex items-center justify-center bg-black/20 rounded">
            <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">
              Preview
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group relative flex flex-col gap-2 bg-white/80 rounded-lg p-3 border border-neutral-100 shadow cursor-pointer hover:bg-neutral-50">
      {renderClipContent()}

      <div className="flex gap-2 mt-2 flex-wrap">
        {clip.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
          >
            #{tag}
          </span>
        ))}
      </div>

      <span className="text-xs text-neutral-400 mt-1 block">
        {clip.created}
      </span>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          className="p-1 rounded hover:bg-orange-100 text-orange-600"
          title="Edit (inline)"
          onClick={() => onEdit(clip.id)}
        >
          <span className="text-lg" title="Edit">
            ✏️
          </span>
        </button>
        <button
          className="p-1 rounded hover:bg-red-100 text-red-500"
          title="Delete"
          onClick={handleDelete}
        >
          <span className="text-lg" title="Delete">
            🗑️
          </span>
        </button>
        <button
          className="p-1 rounded hover:bg-blue-100 text-blue-500"
          title="Copy"
          onClick={handleCopy}
        >
          <span className="text-lg" title="Copy">
            📋
          </span>
        </button>
        {(clip.type === "link" ||
          clip.type === "image" ||
          clip.type === "video") && (
          <a
            href={clip.content}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
            title="Open in new tab"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-lg" title="Open in new tab">
              🔗
            </span>
          </a>
        )}
      </div>
    </div>
  );
};
