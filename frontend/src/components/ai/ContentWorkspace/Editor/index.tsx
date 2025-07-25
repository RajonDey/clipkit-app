import React, { useState, useEffect } from "react";
import { Clip } from "@/types/idea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ToolbarMenu from "./ToolbarMenu";
import TipTapEditor from "./TipTap/TipTapEditor";
import RegenerateDialog from "./RegenerateDialog";
import "@/styles/markdown.css";

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

  // Handle regenerate with custom instructions
  const handleRegenerateWithInstructions = (instructions: string) => {
    if (onRegenerate) {
      onRegenerate(instructions);
    }
    setShowRegenerateDialog(false);
  };
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

    // Add success message/toast here
  };

  // State for custom regeneration instructions
  const [regenerateInstructions, setRegenerateInstructions] =
    useState<string>("");

  // Load saved content from localStorage on mount
  useEffect(() => {
    if (ideaId) {
      const savedContent = localStorage.getItem(`clipkit-content-${ideaId}`);
      if (savedContent && !content) {
        setContent(savedContent);
      }
    }
  }, [ideaId, content, setContent]);

  // Save content to localStorage when it changes
  useEffect(() => {
    if (content && ideaId) {
      localStorage.setItem(`clipkit-content-${ideaId}`, content);
    }
  }, [content, ideaId]);

  // Handle regeneration with custom instructions
  const handleRegenerate = () => {
    if (regenerateInstructions.trim()) {
      // Here we would call the API with custom instructions
      // For now, just log it
      console.log("Regenerating with instructions:", regenerateInstructions);
      // TODO: Implement API call with custom instructions

      setShowRegenerateDialog(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-2 bg-neutral-50 flex justify-between items-center">
        <h3 className="font-medium">Generated Content</h3>
        {content && (
          <div className="space-x-2">
            <button
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
              onClick={copyToClipboard}
            >
              Copy
            </button>
            <button
              className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
              onClick={() => setShowRegenerateDialog(true)}
            >
              Regenerate
            </button>
            <ToolbarMenu
              showExportMenu={showExportMenu}
              setShowExportMenu={setShowExportMenu}
              onExport={exportContent}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              content={content}
              setEditedContent={setEditedContent}
            />
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white">
        {content ? (
          isEditing ? (
            <div className="h-full flex flex-col">
              <TipTapEditor
                content={editedContent}
                setContent={setEditedContent}
                availableClips={availableClips}
              />

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  className="text-xs text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(content); // Reset to original
                  }}
                >
                  Cancel
                </button>
                <button
                  className="text-xs text-green-600 hover:text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-50"
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
            <div className="prose max-w-none markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400">
            <span className="text-4xl mb-4">🤖✨</span>
            <p className="text-center max-w-md">
              Configure your parameters and generate content from your clips.
              <br />
              Your generated content will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
