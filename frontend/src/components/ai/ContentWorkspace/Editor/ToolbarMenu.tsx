import React from "react";
import "./toolbar-menu.css";

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
  return (
    <>
      <div className="toolbar-menu">
        <button
          className="editor-button export-button"
          onClick={() => setShowExportMenu(!showExportMenu)}
        >
          Export <span className="ml-1">▾</span>
        </button>

        <button
          className="editor-button fullscreen-button ml-2"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        {showExportMenu && (
          <div className="export-menu">
            <button
              className="export-menu-item"
              onClick={() => {
                onExport("markdown");
                setShowExportMenu(false);
              }}
            >
              Markdown (.md)
            </button>
            <button
              className="export-menu-item"
              onClick={() => {
                onExport("html");
                setShowExportMenu(false);
              }}
            >
              HTML (.html)
            </button>
            <button
              className="export-menu-item"
              onClick={() => {
                onExport("text");
                setShowExportMenu(false);
              }}
            >
              Plain Text (.txt)
            </button>
          </div>
        )}
      </div>
      <button
        className="editor-button edit-button"
        onClick={() => {
          setIsEditing(!isEditing);
          if (!isEditing) {
            setEditedContent(content);
          }
        }}
      >
        {isEditing ? "View" : "Edit"}
      </button>
    </>
  );
};

export default ToolbarMenu;
