import React from "react";
import { Clip } from "@/types/idea";
import MediaReferenceCode from "./MediaReferenceCode";

interface MediaPreviewProps {
  clip: Clip;
  onClose: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ clip, onClose }) => {
  if (clip.type !== "image" && clip.type !== "video") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            {clip.type === "image" ? "Image Preview" : "Video Preview"}
          </h3>
          <button
            className="text-neutral-500 hover:text-neutral-800"
            onClick={onClose}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center">
          {clip.type === "image" ? (
            <img
              src={clip.content}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : (
            <video
              src={clip.content}
              controls
              className="max-w-full max-h-[70vh]"
            >
              Your browser does not support the video tag.
            </video>
          )}

          <MediaReferenceCode clip={clip} />
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
