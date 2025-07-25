import React, { useState, useEffect } from "react";
import { Clip } from "@/types/idea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ToolbarMenu from "./ToolbarMenu";
import TipTapEditorComplete from "./TipTap/TipTapEditorComplete";
import RegenerateDialog from "./RegenerateDialog";
import "@/styles/markdown.css";
import "./editor-complete.css";

interface EditorProps {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editedContent: string;
  setEditedContent: React.Dispatch<React.SetStateAction<string>>;
  showExportMenu: boolean;
  setShowExportMenu: React.Dispatch<React.SetStateAction<boolean>>;
  availableClips: Clip[];
  ideaId?: string; // Optional idea ID for persisting content
  onRegenerate?: (instructions: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  content,
  setContent,
  isEditing,
  setIsEditing,
  editedContent,
  setEditedContent,
  showExportMenu,
  setShowExportMenu,
  availableClips,
  ideaId,
  onRegenerate,
}) => {
  // State for regenerate dialog
  const [showRegenerateDialog, setShowRegenerateDialog] =
    useState<boolean>(false);

  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Save content to localStorage when it changes
  useEffect(() => {
    if (content && ideaId) {
      localStorage.setItem(`clipkit-content-${ideaId}`, content);
    }
  }, [content, ideaId]);

  // Handle regenerate with custom instructions
  const handleRegenerateWithInstructions = (instructions: string) => {
    if (onRegenerate) {
      onRegenerate(instructions);
    }
    setShowRegenerateDialog(false);
  };

  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    // Add success message/toast here
  };

  // Export content
  const exportContent = (format: "markdown" | "html" | "text") => {
    // Create file content based on format
    let fileContent = content;
    let extension = "md";
    let mimeType = "text/markdown";

    if (format === "html") {
      // Simple markdown to HTML conversion
      const html = content
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      fileContent = `<!DOCTYPE html><html><head><title>Generated Content</title></head><body>${html}</body></html>`;
      extension = "html";
      mimeType = "text/html";
    } else if (format === "text") {
      // Strip markdown formatting
      fileContent = content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1");
      extension = "txt";
      mimeType = "text/plain";
    }

    // Create a download link
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-content.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`editor-complete-wrapper ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      <div className="editor-header">
        <h3>Generated Content</h3>
        {content && (
          <div className="editor-actions">
            <button className="editor-button copy" onClick={copyToClipboard}>
              <span>Copy</span>
            </button>
            <button
              className="editor-button regenerate"
              onClick={() => setShowRegenerateDialog(true)}
            >
              <span>Regenerate</span>
            </button>
            <ToolbarMenu
              showExportMenu={showExportMenu}
              setShowExportMenu={setShowExportMenu}
              onExport={exportContent}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              content={content}
              setEditedContent={setEditedContent}
              isFullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
            />
          </div>
        )}
      </div>

      <div className="editor-content">
        {content ? (
          isEditing ? (
            <div className="h-full flex flex-col">
              <TipTapEditorComplete
                content={content}
                setContent={setEditedContent}
              />

              <div className="editor-action-bar">
                <button
                  className="cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(content); // Reset to original
                  }}
                >
                  Cancel
                </button>
                <button
                  className="save"
                  onClick={() => {
                    setContent(editedContent);
                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-markdown-content markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <div className="editor-empty-state">
            <span className="editor-empty-icon">✨</span>
            <p>
              Configure your parameters and generate content from your clips.
              <br />
              <span style={{ opacity: 0.7, fontSize: "0.9em" }}>
                Your generated content will appear here.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Regenerate Dialog */}
      {showRegenerateDialog && (
        <RegenerateDialog
          isOpen={showRegenerateDialog}
          onClose={() => setShowRegenerateDialog(false)}
          onRegenerate={handleRegenerateWithInstructions}
        />
      )}
    </div>
  );
};

export default Editor;
