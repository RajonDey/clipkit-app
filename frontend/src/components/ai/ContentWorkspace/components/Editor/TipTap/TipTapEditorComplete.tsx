import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Clip } from "@/types/idea";
import SlashCommandMenu from "./SlashCommandMenu";
import FloatingToolbar from "./FloatingToolbar";
import "./styles.css";
import "./prosemirror.css";

// Check if we're running on the client side
const isClient = typeof window !== "undefined";

interface TipTapEditorProps {
  content: string;
  setContent: (content: string) => void;
  availableClips?: Clip[];
  customInstructions?: string;
}

const TipTapEditorComplete: React.FC<TipTapEditorProps> = ({
  content,
  setContent,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSlashMenuActive, setIsSlashMenuActive] = useState(false);

  // Convert markdown to HTML for TipTap initial content
  const getInitialContent = (markdown: string) => {
    if (!markdown) return "";
    // Use marked to convert markdown to HTML
    return marked.parse(markdown);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image,
      Placeholder.configure({
        placeholder: "Type / for commands or start writing...",
      }),
      Link.configure({ openOnClick: false }),
      HorizontalRule,
    ],
    content: isClient ? getInitialContent(content) : "",
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none",
      },
    },
    immediatelyRender: false, // Fix SSR hydration mismatch error
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
    },
  });

  // Handle slash command menu activation
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const { from } = selection;

      // Get text from the cursor position up to 20 characters back
      const textBefore = state.doc.textBetween(Math.max(0, from - 20), from);

      // Check if the last character is a slash
      if (textBefore.endsWith("/")) {
        setIsSlashMenuActive(true);
      } else {
        // Check if we should close the menu (user typed something else)
        const hasSlash = textBefore.includes("/");
        if (!hasSlash) {
          setIsSlashMenuActive(false);
        }
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  // If the parent changes the content externally, update the editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(getInitialContent(content));
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="tiptap-editor-wrapper" ref={editorRef}>
        Loading editor...
      </div>
    );
  }

  return (
    <div className="tiptap-editor-wrapper" ref={editorRef}>
      <EditorContent editor={editor} className="tiptap-editor" />
      {isSlashMenuActive && (
        <SlashCommandMenu
          editor={editor}
          isActive={isSlashMenuActive}
          setIsActive={setIsSlashMenuActive}
        />
      )}
      <FloatingToolbar editor={editor} />
    </div>
  );
};

export default TipTapEditorComplete;
