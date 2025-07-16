import React from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

/**
 * Floating action button component
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300"
      onClick={onClick}
      title="Add New Clip"
      aria-label="Add New Clip"
    >
      <span className="text-2xl font-bold">+</span>
    </button>
  );
};
