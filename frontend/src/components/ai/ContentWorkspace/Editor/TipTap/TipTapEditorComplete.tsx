import React, { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Clip } from "@/types/idea";
import "./editor.css";
import "./prosemirror.css"; // Import ProseMirror specific styles

// Check if we're running on the client side
const isClient = typeof window !== "undefined";

interface TipTapEditorProps {
  content: string;
  setContent: (content: string) => void;
  availableClips?: Clip[];
  customInstructions?: string;
}

const TipTapEditorComplete: React.FC<TipTapEditorProps> = ({
  content: initialContent,
  setContent,
}) => {
  const [content, setLocalContent] = useState<string>(initialContent || "");
  const editorRef = useRef<HTMLDivElement>(null);

  // Process markdown content for TipTap editor
  const processContent = useCallback((contentText: string) => {
    // If content appears to be markdown (not HTML), prepare it for TipTap
    if (!contentText.trim()) {
      return "";
    }

    // Check if content is markdown or HTML
    if (
      contentText.includes("<p>") ||
      contentText.includes("<h1>") ||
      contentText.includes("<div>")
    ) {
      // Already HTML, return as is
      return contentText;
    }

    // Basic markdown conversion for TipTap
    // This is a very basic implementation and might not handle all markdown cases
    return contentText;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      Placeholder.configure({
        placeholder: "Type / for commands or start writing...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: isClient ? processContent(content) : "",
    editorProps: {
      attributes: {
        class: "prose prose-lg focus:outline-none",
      },
    },
    immediatelyRender: false, // Set to false to avoid hydration mismatches with SSR
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      setLocalContent(newContent);
    },
  });

  // Update local content when initialContent changes
  useEffect(() => {
    if (initialContent !== content) {
      setLocalContent(initialContent || "");
    }
  }, [initialContent, content]);

  // Save content to localStorage
  useEffect(() => {
    if (content && isClient) {
      localStorage.setItem("clipkit-generated-content", content);
    }
  }, [content]);

  // Initialize editor content on client-side
  useEffect(() => {
    if (isClient && editor && content) {
      editor.commands.setContent(processContent(content));
    }
  }, [editor, content, processContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-wrapper" ref={editorRef}>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
};

export default TipTapEditorComplete;
