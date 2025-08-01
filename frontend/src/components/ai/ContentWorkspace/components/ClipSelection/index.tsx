import React from "react";
import { Clip } from "@/types/idea";
import ClipTypeFilter from "./ClipTypeFilter";
import ClipList from "./ClipList";

interface ClipSelectionProps {
  clips: Clip[];
  orderedClips: Clip[];
  setOrderedClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  draggedClip: Clip | null;
  setDraggedClip: React.Dispatch<React.SetStateAction<Clip | null>>;
  selectedClipIds: string[];
  setSelectedClipIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeFilter: string;
  setActiveFilter: React.Dispatch<React.SetStateAction<string>>;
  onPreview: (clip: Clip) => void;
}

const ClipSelection: React.FC<ClipSelectionProps> = ({
  clips,
  orderedClips,
  setOrderedClips,
  draggedClip,
  setDraggedClip,
  selectedClipIds,
  setSelectedClipIds,
  activeFilter,
  setActiveFilter,
  onPreview,
}) => {
  // Filtered clips based on active filter
  const filteredClips = orderedClips.filter(
    (clip) => activeFilter === "all" || clip.type === activeFilter
  );

  // Toggle clip selection
  const toggleClipSelection = (clipId: string) => {
    if (selectedClipIds.includes(clipId)) {
      setSelectedClipIds(selectedClipIds.filter((id) => id !== clipId));
    } else {
      setSelectedClipIds([...selectedClipIds, clipId]);
    }
  };

  // Handle drag start
  const handleDragStart = (clip: Clip) => {
    setDraggedClip(clip);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetClip: Clip) => {
    e.preventDefault();
    if (!draggedClip || draggedClip.id === targetClip.id) return;

    // Reorder clips
    const newOrderedClips = [...orderedClips];
    const draggedIndex = newOrderedClips.findIndex(
      (c) => c.id === draggedClip.id
    );
    const targetIndex = newOrderedClips.findIndex(
      (c) => c.id === targetClip.id
    );

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrderedClips.splice(draggedIndex, 1);
      newOrderedClips.splice(targetIndex, 0, draggedClip);
      setOrderedClips(newOrderedClips);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedClip(null);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Clips to Include</h3>
        <button
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() =>
            selectedClipIds.length === clips.length
              ? setSelectedClipIds([])
              : setSelectedClipIds(clips.map((clip) => clip.id))
          }
        >
          {selectedClipIds.length === clips.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      <ClipTypeFilter
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <ClipList
        clips={clips}
        filteredClips={filteredClips}
        selectedClipIds={selectedClipIds}
        draggedClip={draggedClip}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onToggleSelection={toggleClipSelection}
        onPreview={onPreview}
      />
    </div>
  );
};

export default ClipSelection;
