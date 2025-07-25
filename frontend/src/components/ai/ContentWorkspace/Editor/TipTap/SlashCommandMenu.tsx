import React, { useRef, useEffect, useState } from "react";
import { Editor } from "@tiptap/react";

interface SlashCommandMenuProps {
  editor: Editor;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  editor,
  isActive,
  setIsActive,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Position the menu near the cursor
  useEffect(() => {
    if (isActive && menuRef.current) {
      const { view } = editor;
      const { state } = view;
      const { selection } = state;
      const { ranges } = selection;
      const from = Math.min(...ranges.map((range) => range.$from.pos));

      const start = view.coordsAtPos(from);

      menuRef.current.style.position = "absolute";
      menuRef.current.style.top = `${start.top + 24}px`;
      menuRef.current.style.left = `${start.left}px`;
      menuRef.current.style.zIndex = "50";
    }
  }, [isActive, editor]);

  // Track search query to filter commands
  const [searchQuery, setSearchQuery] = useState("");

  // Update search query as user types
  useEffect(() => {
    if (!isActive) return;

    const handleInput = () => {
      const { state } = editor;
      const { selection } = state;
      const { from } = selection;

      // Get text from the cursor position up to 10 characters back
      const textBefore = state.doc.textBetween(Math.max(0, from - 20), from);

      // Extract search query after the slash
      const match = textBefore.match(/\/([^\/\s]*)$/);
      if (match) {
        setSearchQuery(match[1]);
      } else {
        setSearchQuery("");
      }
    };

    // Call immediately to set initial search
    handleInput();

    // Set up listener for future typing
    editor.on("update", handleInput);

    return () => {
      editor.off("update", handleInput);
    };
  }, [isActive, editor]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if it's typing in the search input (except for navigation keys)
      if (
        (event.target as HTMLElement).tagName === "INPUT" &&
        !["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)
      ) {
        return;
      }

      // Prevent default arrow key behavior for navigation keys
      if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
        event.preventDefault();
      }

      const commands = document.querySelectorAll(".slash-command-item");

      switch (event.key) {
        case "ArrowUp":
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : commands.length - 1
          );
          break;
        case "ArrowDown":
          setSelectedIndex((prev) =>
            prev < commands.length - 1 ? prev + 1 : 0
          );
          break;
        case "Enter":
          if (commands[selectedIndex]) {
            (commands[selectedIndex] as HTMLButtonElement).click();
          }
          break;
        case "Escape":
          setIsActive(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, selectedIndex, setIsActive]);

  const allCommands = [
    {
      title: "Heading 1",
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      icon: "H1",
    },
    {
      title: "Heading 2",
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: "H2",
    },
    {
      title: "Bullet List",
      command: () => editor.chain().focus().toggleBulletList().run(),
      icon: "•",
    },
    {
      title: "Numbered List",
      command: () => editor.chain().focus().toggleOrderedList().run(),
      icon: "1.",
    },
    {
      title: "Code Block",
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      icon: "<>",
    },
    {
      title: "Image",
      command: () => {
        const url = prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      icon: "🖼️",
    },
    {
      title: "Blockquote",
      command: () => editor.chain().focus().toggleBlockquote().run(),
      icon: "❝",
    },
    {
      title: "Table",
      command: () => {
        // Insert a basic 3x3 table as HTML
        editor
          .chain()
          .focus()
          .insertContent(
            `
          <table>
            <tbody>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
                <th>Header 3</th>
              </tr>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
                <td>Cell 3</td>
              </tr>
              <tr>
                <td>Cell 4</td>
                <td>Cell 5</td>
                <td>Cell 6</td>
              </tr>
            </tbody>
          </table>
        `
          )
          .run();
      },
      icon: "📊",
    },
  ];

  // Filter commands based on search query
  const filteredCommands = allCommands.filter(
    (command) =>
      searchQuery === "" ||
      command.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  if (!isActive) return null;

  return (
    <div className="slash-command-menu" ref={menuRef}>
      <input
        type="text"
        className="slash-command-input"
        placeholder="Search for a command..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        autoFocus
      />
      <div className="slash-command-menu-items">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((item, index) => (
            <button
              key={index}
              className={`slash-command-item ${
                index === selectedIndex ? "slash-command-item-selected" : ""
              }`}
              onClick={() => {
                // Delete the slash character and search query before executing command
                const deleteLength = 1 + searchQuery.length; // slash + query
                editor.commands.deleteRange({
                  from: editor.state.selection.from - deleteLength,
                  to: editor.state.selection.from,
                });
                item.command();
                setIsActive(false);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="slash-command-icon">{item.icon}</span>
              <span className="slash-command-title">{item.title}</span>
            </button>
          ))
        ) : (
          <div className="slash-command-empty">No commands found</div>
        )}
      </div>
    </div>
  );
};

export default SlashCommandMenu;
