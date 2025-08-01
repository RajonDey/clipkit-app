import React, { useState } from "react";
import "./styles/regenerate-dialog.css";

interface RegenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (instructions: string) => void;
}

const RegenerateDialog: React.FC<RegenerateDialogProps> = ({
  isOpen,
  onClose,
  onRegenerate,
}) => {
  const [instructions, setInstructions] = useState("");

  if (!isOpen) return null;

  return (
    <div className="regenerate-dialog-overlay" onClick={onClose}>
      <div className="regenerate-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Regenerate Content</h3>
        <p>
          Add specific instructions for regenerating the content. This helps
          tailor the output to your needs.
        </p>
        <textarea
          placeholder="E.g., Make it more conversational, focus on the benefits, shorten it, add more technical details, etc."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        ></textarea>
        <div className="regenerate-dialog-buttons">
          <button className="regenerate-dialog-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="regenerate-dialog-regenerate"
            onClick={() => {
              onRegenerate(instructions);
              setInstructions(""); // Clear instructions after submitting
              onClose();
            }}
            disabled={!instructions.trim()}
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegenerateDialog;
