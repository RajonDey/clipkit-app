import React from "react";
import { Clip, ClipType } from "@/types/idea";
import { clipTypeStyles } from "@/styles/tokens";
import { ClipCard } from "./ClipCard";
import { Icons } from "@/components/icons";

interface ClipSectionProps {
  type: ClipType;
  clips: Clip[];
  selectedClipId: string | null;
  onClipEdit: (clipId: string) => void;
  onClipDelete: (clipId: string) => void;
  onClipContentChange: (clipId: string, content: string) => void;
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
  const IconComponent = Icons[meta.icon as keyof typeof Icons];

  return (
    <div
      className={`rounded-xl border-l-4 ${meta.borderColor} ${meta.bgColor} border border-neutral-200 shadow-sm p-4`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${meta.bgColor} ${meta.textColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-neutral-700">{meta.label}</span>
        <span className="text-sm text-neutral-500 bg-white px-2 py-1 rounded-full">
          {typeClips.length} {typeClips.length === 1 ? "clip" : "clips"}
        </span>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
