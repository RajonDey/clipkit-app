import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Clip } from "@/types/idea";
import SlashCommandMenu from "./SlashCommandMenu";
import FloatingFormatMenu from "./FloatingFormatMenu";
import "./editor.css";

interface TipTapEditorProps {
  content: string;
  setContent: (content: string) => void;
  availableClips: Clip[];
  customInstructions?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  setContent,
  availableClips,
  customInstructions,
}) => {
  // State for slash command menu
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);

  // Reference to the editor element for positioning menus
  const editorRef = useRef<HTMLDivElement>(null);

  // State for selected text formatting menu
  const [showFormatMenu, setShowFormatMenu] = useState<boolean>(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: "Type / for commands or start writing...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());

      // Check for slash commands
      const { state } = editor;
      const { selection } = state;
      const { empty, anchor } = selection;

      if (empty) {
        const currentLine = state.doc.textBetween(
          Math.max(0, anchor - 20),
          anchor,
          "\n"
        );

        if (currentLine.endsWith("/")) {
          setShowSlashMenu(true);
        } else {
          setShowSlashMenu(false);
        }
      }

      // Show format menu when text is selected
      setShowFormatMenu(!empty);
    },
  });

  // Save content to localStorage when it changes
  useEffect(() => {
    if (content) {
      localStorage.setItem("clipkit-generated-content", content);
    }
  }, [content]);

  // Helper method to insert an image
  const addImage = (url: string, alt: string = "Image") => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  // Helper method to insert a video
  const addVideo = (url: string) => {
    if (editor) {
      const html = `<div class="video-wrapper"><video src="${url}" controls></video></div>`;
      editor.chain().focus().insertContent(html).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-wrapper">
      <div className="tiptap-toolbar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <span className="italic">I</span>
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          Quote
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code
        </button>

        {/* Media quick insert buttons */}
        <div className="media-insert-dropdown">
          <button className="media-insert-button">Insert Media ▾</button>
          <div className="media-insert-content">
            {availableClips
              .filter((clip) => clip.type === "image")
              .slice(0, 5)
              .map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => addImage(clip.content)}
                  className="media-item"
                >
                  🖼️ {clip.content.split("/").pop() || "Image"}
                </button>
              ))}
            {availableClips
              .filter((clip) => clip.type === "video")
              .slice(0, 5)
              .map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => addVideo(clip.content)}
                  className="media-item"
                >
                  🎬 {clip.content.split("/").pop() || "Video"}
                </button>
              ))}
            <button
              onClick={() => {
                const url = prompt("Enter image URL:");
                if (url) addImage(url);
              }}
              className="media-item"
            >
              + Add Image from URL
            </button>
          </div>
        </div>
      </div>

      {/* Main editor content */}
      <EditorContent editor={editor} className="tiptap-content" />

      {/* Slash Command Menu */}
      {editor && showSlashMenu && (
        <SlashCommandMenu
          editor={editor}
          isActive={showSlashMenu}
          setIsActive={setShowSlashMenu}
        />
      )}
    </div>
  );
};

export default TipTapEditor;
