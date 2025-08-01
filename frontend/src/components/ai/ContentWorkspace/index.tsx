"use client";

import React, { useState, useEffect } from "react";
import { Clip, Idea } from "@/types/idea";
import ContentHeader from "./components/ContentHeader";
import ParametersSection from "./components/ParametersSection";
import ClipSelection from "./components/ClipSelection";
import Editor from "./components/Editor/EditorComplete"; // Use the enhanced editor
import MediaPreview from "./components/MediaPreview";
import { useContentGeneration } from "./hooks/useContentGeneration";
import "./styles/content-workspace.css"; // Import Notion-like styling

// Types for content generation
interface ContentGenerationParams {
  contentType: ContentType;
  tone: ToneType;
  length: LengthType;
}

type ContentType =
  | "article"
  | "script"
  | "social"
  | "outline"
  | "email"
  | "blog";
type ToneType =
  | "professional"
  | "casual"
  | "academic"
  | "creative"
  | "persuasive";
type LengthType = "short" | "medium" | "long";

interface ContentWorkspaceProps {
  idea: Idea;
  clips: Clip[];
  compactMode?: boolean;
  dedicatedPage?: boolean;
}

export const ContentWorkspace: React.FC<ContentWorkspaceProps> = ({
  idea,
  clips,
  compactMode = false,
  dedicatedPage = false,
}) => {
  // State for content parameters
  const [params, setParams] = useState<ContentGenerationParams>({
    contentType: "article",
    tone: "professional",
    length: "medium",
  });

  // State for generated content
  const [generatedContent, setGeneratedContent] = useState<string>("");

  // State for editing mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // State for edited content (used in edit mode)
  const [editedContent, setEditedContent] = useState<string>("");

  // State for loading status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // State for error messages
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State for clip filtering
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // State for selected clips (by default, all clips are selected)
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>(
    clips.map((clip) => clip.id)
  );

  // State for clip order
  const [orderedClips, setOrderedClips] = useState<Clip[]>(clips);

  // State for drag and drop
  const [draggedClip, setDraggedClip] = useState<Clip | null>(null);

  // State for clip preview
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);

  // State for export menu
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Update ordered clips when clips prop changes
  React.useEffect(() => {
    setOrderedClips(clips);
  }, [clips]);

  // Load saved content from localStorage on mount
  React.useEffect(() => {
    const savedContent = localStorage.getItem(`clipkit-content-${idea.id}`);
    if (savedContent) {
      setGeneratedContent(savedContent);
    }
  }, [idea.id]);

  // Save content to localStorage when it changes
  React.useEffect(() => {
    if (generatedContent) {
      localStorage.setItem(`clipkit-content-${idea.id}`, generatedContent);
    }
  }, [generatedContent, idea.id]);

  // Content generation hooks
  const {
    generatedContent: apiGeneratedContent,
    isGenerating: isGeneratingFromHook,
    errorMessage: apiErrorMessage,
    generateContent,
  } = useContentGeneration(idea, orderedClips, selectedClipIds);

  // Update local state when API responds
  useEffect(() => {
    if (apiGeneratedContent) {
      setGeneratedContent(apiGeneratedContent);
    }
  }, [apiGeneratedContent]);

  useEffect(() => {
    setIsGenerating(isGeneratingFromHook);
  }, [isGeneratingFromHook]);

  useEffect(() => {
    if (apiErrorMessage) {
      setErrorMessage(apiErrorMessage);
    }
  }, [apiErrorMessage]);

  // Generate content handler (passing to Parameters section)
  const handleGenerateContent = async () => {
    try {
      await generateContent(params);
    } catch (error) {
      console.error("Generation error:", error);
    }
  };

  // Regenerate content with custom instructions
  const handleRegenerate = async (instructions: string) => {
    try {
      await generateContent(params, instructions);
    } catch (error) {
      console.error("Regeneration error:", error);
    }
  };

  return (
    <div
      className={`flex flex-col h-full notion-inspired-container ${
        compactMode ? "compact-mode" : ""
      } ${dedicatedPage ? "dedicated-page" : ""}`}
    >
      {!dedicatedPage && <ContentHeader />}

      <div
        className={`workspace-layout ${dedicatedPage ? "dedicated-page" : ""}`}
      >
        <div className="workspace-sidebar">
          <div>
            <ParametersSection
              params={params}
              setParams={setParams}
              isGenerating={isGenerating}
              errorMessage={errorMessage}
              onGenerate={handleGenerateContent}
              hasSelectedClips={selectedClipIds.length > 0}
            />
          </div>

          <div>
            <ClipSelection
              clips={clips}
              orderedClips={orderedClips}
              setOrderedClips={setOrderedClips}
              draggedClip={draggedClip}
              setDraggedClip={setDraggedClip}
              selectedClipIds={selectedClipIds}
              setSelectedClipIds={setSelectedClipIds}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onPreview={(clip: Clip) => setPreviewClip(clip)}
            />
          </div>
        </div>

        <div className="workspace-editor">
          <Editor
            content={generatedContent}
            setContent={setGeneratedContent}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editedContent={editedContent}
            setEditedContent={setEditedContent}
            showExportMenu={showExportMenu}
            setShowExportMenu={setShowExportMenu}
            availableClips={orderedClips.filter((clip) =>
              selectedClipIds.includes(clip.id)
            )}
            ideaId={idea.id}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>

      {previewClip && (
        <MediaPreview clip={previewClip} onClose={() => setPreviewClip(null)} />
      )}
    </div>
  );
};

export default ContentWorkspace;
