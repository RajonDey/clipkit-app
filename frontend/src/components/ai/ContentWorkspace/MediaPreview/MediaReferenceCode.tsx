import React from "react";
import { Clip } from "@/types/idea";

interface MediaReferenceCodeProps {
  clip: Clip;
}

const MediaReferenceCode: React.FC<MediaReferenceCodeProps> = ({ clip }) => {
  const referenceCode =
    clip.type === "image"
      ? `![${clip.content.split("/").pop() || "Image"}](${clip.content})`
      : `<video src="${clip.content}" controls></video>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referenceCode);
    // Add a success toast/notification here in the future
  };

  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Reference in content:</h4>
        <button
          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
      <div className="bg-neutral-100 p-3 rounded font-mono text-sm">
        {referenceCode}
      </div>
      <p className="text-xs text-neutral-500 mt-2">
        Copy this code to reference this media in your content.
      </p>
    </div>
  );
};

export default MediaReferenceCode;
