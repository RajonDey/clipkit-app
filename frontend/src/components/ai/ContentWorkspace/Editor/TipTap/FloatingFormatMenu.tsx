import React from "react";
import { Editor } from "@tiptap/react";

interface FloatingFormatMenuProps {
  editor: Editor;
}

const FloatingFormatMenu: React.FC<FloatingFormatMenuProps> = ({ editor }) => {
  if (!editor) return null;

  const formatOptions = [
    {
      name: "bold",
      label: "B",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      name: "italic",
      label: "I",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      name: "link",
      label: "🔗",
      action: () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
          return;
        }

        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return;
        }

        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      },
      isActive: () => editor.isActive("link"),
    },
    {
      name: "code",
      label: "</>",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    {
      name: "clear",
      label: "🧹",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
  ];

  return (
    <div className="floating-format-menu">
      {formatOptions.map((option) => (
        <button
          key={option.name}
          onClick={option.action}
          className={option.isActive && option.isActive() ? "is-active" : ""}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FloatingFormatMenu;
