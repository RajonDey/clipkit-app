import React, { useState, useRef, useEffect } from "react";
import "./styles/toolbar-menu.css";

interface ToolbarMenuProps {
  showExportMenu: boolean;
  setShowExportMenu: React.Dispatch<React.SetStateAction<boolean>>;
  onExport: (format: "markdown" | "html" | "text") => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  content: string;
  setEditedContent: React.Dispatch<React.SetStateAction<string>>;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}

const ToolbarMenu: React.FC<ToolbarMenuProps> = ({
  showExportMenu,
  setShowExportMenu,
  onExport,
  isEditing,
  setIsEditing,
  content,
  setEditedContent,
  isFullscreen = false,
  toggleFullscreen = () => {},
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowExportMenu]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Main Actions Button */}
      <button
        className="px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-2"
        onClick={() => setShowExportMenu(!showExportMenu)}
        title="More actions"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">More</span>
        <span className="text-xs">▾</span>
      </button>

      {/* Dropdown Menu */}
      {showExportMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[160px] z-10">
          {/* Edit/View Toggle */}
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) {
                setEditedContent(content);
              }
              setShowExportMenu(false);
            }}
          >
            <span>{isEditing ? "👁️" : "✏️"}</span>
            {isEditing ? "View Mode" : "Edit Mode"}
          </button>

          {/* Fullscreen Toggle */}
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
            onClick={() => {
              toggleFullscreen();
              setShowExportMenu(false);
            }}
          >
            <span>{isFullscreen ? "📱" : "🖥️"}</span>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

          <div className="border-t border-neutral-100 my-1"></div>

          {/* Export Options */}
          <div className="px-2 py-1 text-xs text-neutral-500 font-medium">
            Export as:
          </div>

          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
            onClick={() => {
              onExport("markdown");
              setShowExportMenu(false);
            }}
          >
            <span>📄</span>
            Markdown (.md)
          </button>

          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
            onClick={() => {
              onExport("html");
              setShowExportMenu(false);
            }}
          >
            <span>🌐</span>
            HTML (.html)
          </button>

          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
            onClick={() => {
              onExport("text");
              setShowExportMenu(false);
            }}
          >
            <span>📝</span>
            Plain Text (.txt)
          </button>
        </div>
      )}
    </div>
  );
};

export default ToolbarMenu;
