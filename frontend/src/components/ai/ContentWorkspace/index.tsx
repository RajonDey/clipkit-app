"use client";

import React, { useState, useEffect } from "react";
import { Clip, Idea } from "@/types/idea";
import ContentHeader from "./ContentHeader";
import ParametersSection from "./ParametersSection";
import ClipSelection from "./ClipSelection";
import Editor from "./Editor/EditorComplete"; // Use the enhanced editor
import MediaPreview from "./MediaPreview";
import { useContentGeneration } from "./hooks/useContentGeneration";
import "./content-workspace.css"; // Import Notion-like styling

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
      <ContentHeader />

      <div className="workspace-layout flex flex-col lg:flex-row lg:gap-4">
        <div className="workspace-sidebar lg:w-1/3 mb-4 lg:mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 mb-4">
            <ParametersSection
              params={params}
              setParams={setParams}
              isGenerating={isGenerating}
              errorMessage={errorMessage}
              onGenerate={handleGenerateContent}
              hasSelectedClips={selectedClipIds.length > 0}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4">
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

        <div className="workspace-editor lg:w-2/3 bg-white rounded-xl shadow-sm border border-neutral-100 p-4">
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
