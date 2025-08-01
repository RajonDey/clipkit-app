import React from "react";

interface ClipTypeFilterProps {
  activeFilter: string;
  setActiveFilter: React.Dispatch<React.SetStateAction<string>>;
}

const ClipTypeFilter: React.FC<ClipTypeFilterProps> = ({
  activeFilter,
  setActiveFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button
        className={`text-xs px-3 py-1 rounded-full transition ${
          activeFilter === "all"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("all")}
      >
        All
      </button>
      <button
        className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
          activeFilter === "text"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("text")}
      >
        <span className="mr-1">📝</span> Text
      </button>
      <button
        className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
          activeFilter === "link"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("link")}
      >
        <span className="mr-1">🔗</span> Links
      </button>
      <button
        className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
          activeFilter === "image"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("image")}
      >
        <span className="mr-1">🖼️</span> Images
      </button>
      <button
        className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
          activeFilter === "video"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("video")}
      >
        <span className="mr-1">🎬</span> Videos
      </button>
      <button
        className={`text-xs px-3 py-1 rounded-full transition flex items-center ${
          activeFilter === "code"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200"
        }`}
        onClick={() => setActiveFilter("code")}
      >
        <span className="mr-1">💻</span> Code
      </button>
    </div>
  );
};

export default ClipTypeFilter;
