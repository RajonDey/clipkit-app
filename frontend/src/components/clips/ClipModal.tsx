import React from "react";
import Image from "next/image";
import { Clip } from "@/types/idea";
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  createYouTubeEmbedUrl,
} from "@/lib/videoUtils";

interface ClipModalProps {
  clip: Clip;
  onClose: () => void;
}

/**
 * Modal component for previewing and editing a clip
 */
export const ClipModal: React.FC<ClipModalProps> = ({ clip, onClose }) => {
  if (!clip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-neutral-200 relative">
        <button
          className="absolute top-3 right-3 text-neutral-400 hover:text-orange-500 text-2xl"
          onClick={onClose}
          title="Close preview"
        >
          ×
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">
            {clip.type === "text" && "📝"}
            {clip.type === "link" && "🔗"}
            {clip.type === "image" && "🖼️"}
            {clip.type === "video" && "🎬"}
            {clip.type === "code" && "💻"}
          </span>

          <div className="flex-1">
            <div className="text-xs text-neutral-400">{clip.created}</div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {clip.tags &&
                clip.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-2">
          {clip.type === "image" ? (
            <div className="relative aspect-[4/3] mb-2">
              <Image
                src={clip.content}
                alt="clip"
                fill
                className="object-contain rounded shadow"
                sizes="(max-width: 768px) 100vw, 384px"
                priority={false}
              />
            </div>
          ) : clip.type === "video" ? (
            (() => {
              const isYoutube = isYouTubeUrl(clip.content);
              const videoId = isYoutube
                ? extractYouTubeVideoId(clip.content)
                : null;
              const embedUrl = videoId ? createYouTubeEmbedUrl(videoId) : "";

              return isYoutube && videoId ? (
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video rounded shadow mb-2"
                  title="YouTube video player"
                />
              ) : (
                <video
                  src={clip.content}
                  controls
                  className="w-full aspect-video rounded shadow bg-black mb-2"
                />
              );
            })()
          ) : clip.type === "code" ? (
            <pre className="overflow-x-auto text-sm p-4 rounded bg-neutral-900 text-orange-200 font-mono mb-2">
              <code>{clip.content}</code>
            </pre>
          ) : clip.type === "link" ? (
            <a
              href={clip.content}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-orange-600 hover:text-orange-800 break-all text-base mb-2"
            >
              {clip.content}
            </a>
          ) : (
            <div className="whitespace-pre-line text-neutral-800 text-lg mb-2">
              {clip.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
