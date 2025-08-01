import React from "react";
import Image from "next/image";
import { Clip } from "@/types/idea";
import { Icons } from "@/components/icons";
import { buttonStyles } from "@/styles/tokens";
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  createYouTubeEmbedUrl,
} from "@/lib/videoUtils";

interface ClipCardProps {
  clip: Clip;
  onEdit: (clipId: string) => void;
  onDelete: (clipId: string) => void;
  onContentChange?: (clipId: string, content: string) => void;
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
    toast.textContent = "Copied to clipboard!";
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadein";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2000);
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
              onClick={() => onEdit("")} // Pass empty string to deselect
            >
              Save
            </button>
            <button
              className="px-3 py-1 rounded bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              title="Cancel"
              onClick={() => onEdit("")} // Pass empty string to deselect
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (clip.type === "image") {
      return (
        <div className="w-full h-auto max-h-[300px] overflow-hidden rounded-lg">
          <Image
            src={clip.content}
            alt="clip"
            width={400}
            height={300}
            className="object-cover w-full h-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
            sizes="(max-width: 768px) 100vw, 400px"
            priority={false}
          />
        </div>
      );
    }

    if (clip.type === "video") {
      const isYoutube = isYouTubeUrl(clip.content);
      const videoId = isYoutube ? extractYouTubeVideoId(clip.content) : null;
      const embedUrl = videoId ? createYouTubeEmbedUrl(videoId) : "";

      return (
        <div className="relative aspect-video rounded-lg overflow-hidden">
          {isYoutube && videoId ? (
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg shadow-sm"
              title="YouTube video player"
            />
          ) : (
            <video
              src={clip.content}
              controls
              className="w-full h-full rounded-lg shadow-sm bg-black object-contain"
            />
          )}
          <div className="absolute inset-0 hidden group-hover/video:flex items-center justify-center bg-black/30 rounded-lg">
            <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">
              Preview
            </span>
          </div>
        </div>
      );
    }

    if (clip.type === "code") {
      return (
        <pre className="overflow-x-auto text-xs p-3 rounded-lg bg-neutral-900 text-orange-200 font-mono max-h-[200px]">
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
            className="underline text-orange-600 hover:text-orange-800 break-all p-3 bg-orange-50 rounded-lg block hover:bg-orange-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {clip.content}
          </a>
          <div className="absolute inset-0 hidden group-hover/link:flex items-center justify-center bg-black/20 rounded-lg">
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
    <div className="group relative flex flex-col gap-3 bg-white rounded-xl p-4 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-neutral-300">
      {renderClipContent()}

      <div className="flex gap-2 flex-wrap">
        {clip.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      <span className="text-xs text-neutral-400 mt-1 block">
        {clip.created}
      </span>

      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          className={buttonStyles.icon}
          title="Edit"
          onClick={() => onEdit(clip.id)}
        >
          <Icons.edit className="w-4 h-4" />
        </button>
        <button
          className={buttonStyles.iconDanger}
          title="Delete"
          onClick={handleDelete}
        >
          <Icons.delete className="w-4 h-4" />
        </button>
        <button
          className={buttonStyles.iconBlue}
          title="Copy to clipboard"
          onClick={handleCopy}
        >
          <Icons.copy className="w-4 h-4" />
        </button>
        {(clip.type === "link" ||
          clip.type === "image" ||
          clip.type === "video") && (
          <a
            href={clip.content}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles.iconNeutral}
            title="Open in new tab"
            onClick={(e) => e.stopPropagation()}
          >
            <Icons.externalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
