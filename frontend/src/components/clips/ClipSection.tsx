import React from "react";
import { Clip, ClipType } from "@/types/idea";
import { clipTypeStyles } from "@/styles/tokens";
import { ClipCard } from "./ClipCard";

interface ClipSectionProps {
  type: ClipType;
  clips: Clip[];
  selectedClipId: number | null;
  onClipEdit: (clipId: number) => void;
  onClipDelete: (clipId: number) => void;
  onClipContentChange: (clipId: number, content: string) => void;
}

/**
 * Renders a section of clips for a specific content type
 */
export const ClipSection: React.FC<ClipSectionProps> = ({
  type,
  clips,
  selectedClipId,
  onClipEdit,
  onClipDelete,
  onClipContentChange,
}) => {
  const typeClips = clips.filter((clip) => clip.type === type);

  if (typeClips.length === 0) return null;

  const meta = clipTypeStyles[type];

  return (
    <div
      className={`rounded-xl border-l-4 ${meta.color} border border-neutral-200 shadow-sm p-4`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl select-none">{meta.icon}</span>
        <span className="font-bold text-lg text-neutral-700">{meta.label}</span>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {typeClips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onEdit={onClipEdit}
            onDelete={onClipDelete}
            onContentChange={onClipContentChange}
            isEditing={clip.id === selectedClipId}
          />
        ))}
      </div>
    </div>
  );
};
