# ClipKit Notion-like Editor

A rich text editor for ClipKit with Notion-like features including slash commands, content persistence, and regeneration capabilities.

## Features

- **Rich Text Editing**: Full-featured editor with formatting options, headings, lists, blockquotes, and code blocks
- **Slash Commands**: Type `/` to access commands like headings, lists, and media embedding
- **Content Persistence**: Automatically saves content to localStorage, keyed by idea ID
- **Content Regeneration**: Regenerate content with custom instructions
- **Media Embedding**: Easily embed images and videos from your clips
- **Export Options**: Export content in Markdown, HTML, or plain text formats

## Components

- **EditorComplete**: Main editor component with view/edit modes
- **TipTapEditorComplete**: Rich text editor implementation using TipTap
- **RegenerateDialog**: Dialog for entering custom regeneration instructions

## Usage

```tsx
import EditorComplete from "@/components/ai/ContentWorkspace/Editor/EditorComplete";

// Inside your component
const [content, setContent] = useState("");
const [isEditing, setIsEditing] = useState(false);
const [editedContent, setEditedContent] = useState("");
const [showExportMenu, setShowExportMenu] = useState(false);

return (
  <EditorComplete
    content={content}
    setContent={setContent}
    isEditing={isEditing}
    setIsEditing={setIsEditing}
    editedContent={editedContent}
    setEditedContent={setEditedContent}
    showExportMenu={showExportMenu}
    setShowExportMenu={setShowExportMenu}
    availableClips={clips}
    ideaId={idea.id}
    onRegenerate={handleRegenerate}
  />
);
```

## Customization

See the `IMPLEMENTATION_GUIDE.md` file for detailed customization options including:

- Adding new slash commands
- Adding TipTap extensions
- Creating new export formats
- Styling customization
- Adding collaborative editing

## Dependencies

- TipTap Editor (@tiptap/react, @tiptap/starter-kit, etc.)
- React Markdown (for rendering content in view mode)
- Remark GFM (for GitHub-flavored markdown support)
- Rehype Raw (for HTML rendering in markdown)

## Local Storage

Content is stored in localStorage with the key pattern:

```
clipkit-content-{ideaId}
```

This allows for per-idea content persistence across page reloads.
