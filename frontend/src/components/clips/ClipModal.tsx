import React from "react";
import Image from "next/image";
import { Clip } from "@/types/idea";
import { Icons } from "@/components/icons";
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

  const getIconForType = (type: string) => {
    switch (type) {
      case "text":
        return <Icons.text className="w-6 h-6" />;
      case "link":
        return <Icons.link className="w-6 h-6" />;
      case "image":
        return <Icons.image className="w-6 h-6" />;
      case "video":
        return <Icons.video className="w-6 h-6" />;
      case "code":
        return <Icons.code className="w-6 h-6" />;
      default:
        return <Icons.text className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-neutral-200 relative max-h-[90vh] overflow-hidden">
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-orange-500 transition-colors z-10"
          onClick={onClose}
          title="Close preview"
        >
          <Icons.close className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              {getIconForType(clip.type)}
            </div>

            <div className="flex-1">
              <div className="text-xs text-neutral-400 mb-1">
                {clip.created}
              </div>
              <div className="flex gap-2 flex-wrap">
                {clip.tags &&
                  clip.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            {clip.type === "image" ? (
              <div className="relative max-h-[60vh] overflow-hidden rounded-lg">
                <Image
                  src={clip.content}
                  alt="clip"
                  width={800}
                  height={600}
                  className="object-contain w-full h-full rounded-lg shadow-sm"
                  sizes="(max-width: 768px) 100vw, 800px"
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
                  </div>
                );
              })()
            ) : clip.type === "code" ? (
              <pre className="overflow-x-auto text-sm p-4 rounded-lg bg-neutral-900 text-orange-200 font-mono max-h-[60vh]">
                <code>{clip.content}</code>
              </pre>
            ) : clip.type === "link" ? (
              <a
                href={clip.content}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-orange-600 hover:text-orange-800 break-all text-base p-4 bg-orange-50 rounded-lg block hover:bg-orange-100 transition-colors"
              >
                {clip.content}
              </a>
            ) : (
              <div className="whitespace-pre-line text-neutral-800 text-lg p-4 bg-neutral-50 rounded-lg">
                {clip.content}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-neutral-200">
            <button
              onClick={() => {
                navigator.clipboard.writeText(clip.content);
                // Show toast
                const toast = document.createElement("div");
                toast.textContent = "Copied to clipboard!";
                toast.className =
                  "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
                document.body.appendChild(toast);
                setTimeout(() => {
                  toast.remove();
                }, 2000);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Icons.copy className="w-4 h-4" />
              Copy Content
            </button>
            {(clip.type === "link" ||
              clip.type === "image" ||
              clip.type === "video") && (
              <a
                href={clip.content}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-500 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Icons.externalLink className="w-4 h-4" />
                Open
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
