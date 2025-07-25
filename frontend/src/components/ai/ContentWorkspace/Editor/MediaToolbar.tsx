import React from "react";
import { Clip } from "@/types/idea";

interface MediaToolbarProps {
  availableClips: Clip[];
  onInsertMedia: (mediaCode: string) => void;
}

const MediaToolbar: React.FC<MediaToolbarProps> = ({
  availableClips,
  onInsertMedia,
}) => {
  const imageClips = availableClips
    .filter((clip) => clip.type === "image")
    .slice(0, 3); // Show up to 3 recent images

  const videoClips = availableClips
    .filter((clip) => clip.type === "video")
    .slice(0, 2); // Show up to 2 recent videos

  return (
    <div className="flex items-center space-x-3 my-2 p-2 bg-neutral-50 rounded-md border border-neutral-200">
      <span className="text-xs text-neutral-500">Insert:</span>
      <div className="flex space-x-1">
        {imageClips.map((clip) => (
          <button
            key={clip.id}
            className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center"
            onClick={() => {
              const imageRef = `\n![${
                clip.content.split("/").pop() || "Image"
              }](${clip.content})\n`;
              onInsertMedia(imageRef);
            }}
          >
            <span className="mr-1">🖼️</span> Image
          </button>
        ))}

        {videoClips.map((clip) => (
          <button
            key={clip.id}
            className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 flex items-center"
            onClick={() => {
              const videoRef = `\n<video src="${clip.content}" controls></video>\n`;
              onInsertMedia(videoRef);
            }}
          >
            <span className="mr-1">🎬</span> Video
          </button>
        ))}
      </div>

      {/* Formatting buttons */}
      <div className="ml-auto flex space-x-1">
        <button
          className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
          onClick={() => onInsertMedia("**Bold text**")}
        >
          B
        </button>
        <button
          className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300 italic"
          onClick={() => onInsertMedia("*Italic text*")}
        >
          I
        </button>
        <button
          className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
          onClick={() => onInsertMedia("\n## Heading\n")}
        >
          H
        </button>
        <button
          className="text-xs bg-white text-neutral-600 hover:bg-neutral-100 px-2 py-1 rounded border border-neutral-300"
          onClick={() => onInsertMedia("\n- List item\n- List item\n")}
        >
          • List
        </button>
      </div>
    </div>
  );
};

export default MediaToolbar;
