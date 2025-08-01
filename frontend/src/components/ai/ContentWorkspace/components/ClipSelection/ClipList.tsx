import React from "react";
import { Clip } from "@/types/idea";
import ClipItem from "./ClipItem";

interface ClipListProps {
  clips: Clip[];
  filteredClips: Clip[];
  selectedClipIds: string[];
  draggedClip: Clip | null;
  onDragStart: (clip: Clip) => void;
  onDragOver: (e: React.DragEvent, clip: Clip) => void;
  onDragEnd: () => void;
  onToggleSelection: (clipId: string) => void;
  onPreview: (clip: Clip) => void;
}

const ClipList: React.FC<ClipListProps> = ({
  clips,
  filteredClips,
  selectedClipIds,
  draggedClip,
  onDragStart,
  onDragOver,
  onDragEnd,
  onToggleSelection,
  onPreview,
}) => {
  return (
    <div className="max-h-40 overflow-y-auto border border-neutral-100 rounded-md bg-neutral-50 p-2">
      {clips.length === 0 ? (
        <div className="text-center text-neutral-400 py-4">
          No clips available. Add some clips first!
        </div>
      ) : filteredClips.length === 0 ? (
        <div className="text-center text-neutral-400 py-4">
          No clips match the selected filter.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClips.map((clip) => (
            <ClipItem
              key={clip.id}
              clip={clip}
              isSelected={selectedClipIds.includes(clip.id)}
              isDragged={draggedClip?.id === clip.id}
              onDragStart={() => onDragStart(clip)}
              onDragOver={(e) => onDragOver(e, clip)}
              onDragEnd={onDragEnd}
              onToggleSelection={() => onToggleSelection(clip.id)}
              onPreview={() => onPreview(clip)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClipList;
