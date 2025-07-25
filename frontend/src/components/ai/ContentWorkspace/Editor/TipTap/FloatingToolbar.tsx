import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";

interface FloatingToolbarProps {
  editor: Editor;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ editor }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateToolbar = () => {
      const isTextSelected = !editor.state.selection.empty;
      setIsVisible(isTextSelected);

      if (isTextSelected && toolbarRef.current) {
        const { view } = editor;
        const { state } = view;
        const { selection } = state;
        const { ranges } = selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        // Get the coordinates of the selection
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // Position the toolbar above the selection
        const left = (start.left + end.left) / 2;
        const top = start.top - 10;

        toolbarRef.current.style.left = `${left}px`;
        toolbarRef.current.style.top = `${top}px`;
        toolbarRef.current.style.transform = "translate(-50%, -100%)";
      }
    };

    // Update on selection change
    editor.on("selectionUpdate", updateToolbar);

    // Initial update
    updateToolbar();

    return () => {
      editor.off("selectionUpdate", updateToolbar);
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div ref={toolbarRef} className="floating-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
      >
        <em>I</em>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "is-active" : ""}
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "is-active" : ""}
      >
        <s>S</s>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "is-active" : ""}
      >
        {"<>"}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleMark("highlight").run()}
        className={editor.isActive("highlight") ? "is-active" : ""}
      >
        <span style={{ backgroundColor: "yellow" }}>H</span>
      </button>
      <div className="toolbar-separator"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
      >
        H2
      </button>
    </div>
  );
};

export default FloatingToolbar;
