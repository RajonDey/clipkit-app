"use client";

import React from "react";

/**
 * Print button component with enhanced print functionality
 */
export default function PrintButton() {
  const handlePrint = () => {
    // Before printing, add title attribute to workspace container
    const workspaceContainer = document.querySelector(".workspace-container");
    const ideaTitle = document.querySelector(
      ".workspace-header h2"
    )?.textContent;

    if (workspaceContainer && ideaTitle) {
      workspaceContainer.setAttribute("data-idea-title", ideaTitle);
    }

    // Execute print command
    window.print();
  };

  return (
    <button
      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 flex items-center gap-2"
      onClick={handlePrint}
      title="Print or save as PDF"
    >
      <span>Print/Export</span>
    </button>
  );
}
