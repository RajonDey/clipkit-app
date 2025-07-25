# Notion-like Editor Integration Guide

This guide explains how to use and extend the Notion-like editor implementation for ClipKit's content workspace.

## Components Overview

### `ContentWorkspace`

The main container component that manages the overall state and coordinates between child components.

### `Editor`/`EditorComplete`

The main editor component that handles rendering of content, switching between view and edit modes, and provides access to export and regeneration features.

### `TipTapEditorComplete`

The rich text editor implementation using TipTap that provides a Notion-like experience with slash commands, formatting options, and media embedding.

### `RegenerateDialog`

A dialog component for entering custom instructions when regenerating content.

## How to Use

### Basic Usage

1. The `ContentWorkspace` component is the main entry point:

```tsx
<ContentWorkspace idea={ideaData} clips={clipsData} />
```

2. The content generation and editing features are already connected and will work automatically. The editor supports:
   - Markdown rendering of generated content
   - Rich-text editing with TipTap
   - Content persistence to localStorage
   - Content regeneration with custom instructions

### Customizing Editor Features

#### Adding New Slash Commands

To add new slash commands to the editor, modify the `slashCommands` array in `TipTapEditorComplete.tsx`:

```tsx
// Define slash commands
const slashCommands = [
  // Existing commands...

  // Add a new command
  {
    title: "My Custom Command",
    command: () => {
      // Implement your command logic here
      editor?.chain().focus().insertContent("Custom content").run();
    },
    icon: "🔥", // Choose an appropriate emoji or icon
  },
];
```

#### Adding TipTap Extensions

The editor uses TipTap's extension system. To add new extensions:

1. Install the extension: `npm install @tiptap/extension-my-extension`
2. Import it in `TipTapEditorComplete.tsx`:
   ```tsx
   import MyExtension from "@tiptap/extension-my-extension";
   ```
3. Add it to the extensions array:
   ```tsx
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
       MyExtension.configure({
         // Your extension configuration
       }),
     ],
     // Rest of the configuration...
   });
   ```

## Content Persistence

Content is automatically persisted to localStorage based on the idea ID:

```tsx
// Save content to localStorage when it changes
useEffect(() => {
  if (content && ideaId) {
    localStorage.setItem(`clipkit-content-${ideaId}`, content);
  }
}, [content, ideaId]);
```

## Regeneration with Custom Instructions

The regeneration feature allows users to provide custom instructions to guide the content generation. This is implemented via:

1. The `RegenerateDialog` component that collects user instructions
2. The `handleRegenerate` function in `ContentWorkspace` that passes these instructions to the API
3. The updated `api.ts` interface that supports custom instructions

To call for regeneration with custom instructions:

```tsx
// Show the regenerate dialog
setShowRegenerateDialog(true);

// When the user submits instructions
const handleRegenerateWithInstructions = (instructions: string) => {
  onRegenerate(instructions);
  setShowRegenerateDialog(false);
};
```

## Extending the Implementation

### Adding New Export Formats

To add new export formats, modify the `exportContent` function in `EditorComplete.tsx`:

```tsx
const exportContent = (
  format: "markdown" | "html" | "text" | "your-new-format"
) => {
  // Existing formats...

  if (format === "your-new-format") {
    // Transform content to your new format
    fileContent = transformToNewFormat(content);
    extension = "xyz";
    mimeType = "application/xyz";
  }

  // Rest of the function...
};
```

### Adding Collaborative Editing

For collaborative editing, you can extend the implementation with TipTap's collaboration extensions:

1. Install the required packages:

   ```bash
   npm install @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor y-websocket yjs
   ```

2. Implement the collaboration provider and connect it to your backend.

## CSS Customization

The editor's appearance is controlled by several CSS files:

- `editor.css` - Styles for the TipTap editor
- `regenerate-dialog.css` - Styles for the regeneration dialog
- `markdown.css` - Styles for the rendered markdown content

To customize the appearance, modify these files or override their styles in your global CSS.

## Troubleshooting

### Common Issues

1. **Content not saving**: Ensure the `ideaId` prop is correctly passed to the Editor component.

2. **Slash commands not appearing**: Check if the editor is correctly detecting the slash key. The detection happens in the `onUpdate` callback.

3. **Media embedding issues**: Verify that the media URLs are accessible and in the correct format.

### Debugging

The implementation includes various console logs to help with debugging:

- Content generation status and errors
- Token validation and debugging
- API responses

Enable browser developer tools to view these logs and diagnose issues.

## Future Enhancements

Consider these future enhancements:

1. **Real-time collaboration** using Y.js and WebSockets
2. **Version history** for content revisions
3. **AI-assisted editing** with inline suggestions
4. **Enhanced media handling** with drag-and-drop and resize capabilities
5. **Table support** for structured content
