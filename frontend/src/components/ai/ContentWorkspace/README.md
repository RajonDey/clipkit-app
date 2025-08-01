# ContentWorkspace Component

A Notion-like content editor workspace with AI-powered content generation and rich text editing capabilities.

## Structure

```
ContentWorkspace/
├── index.tsx                    # Main workspace component
├── styles/
│   └── content-workspace.css   # Main workspace styles
├── components/
│   ├── ContentHeader/          # Workspace header component
│   ├── ParametersSection/      # AI generation parameters
│   ├── ClipSelection/          # Clip selection and ordering
│   ├── MediaPreview/           # Media preview modal
│   └── Editor/                 # Rich text editor
│       ├── EditorComplete.tsx  # Main editor wrapper
│       ├── ToolbarMenu.tsx     # Export and action toolbar
│       ├── RegenerateDialog.tsx # AI regeneration dialog
│       ├── TipTap/             # TipTap editor components
│       │   ├── TipTapEditorComplete.tsx # Enhanced TipTap editor
│       │   ├── SlashCommandMenu.tsx     # '/' command menu
│       │   ├── FloatingToolbar.tsx      # Text selection toolbar
│       │   └── styles.css               # TipTap editor styles
│       └── styles/             # Editor-specific styles
└── hooks/
    └── useContentGeneration.tsx # AI content generation hook
```

## Features

### 🎯 Core Functionality

- **AI Content Generation**: Generate content from selected clips
- **Rich Text Editing**: Notion-like editing experience
- **Content Persistence**: Automatic saving to localStorage
- **Export Options**: Markdown, HTML, plain text

### ✨ Notion-like Features

- **Slash Commands**: Type `/` for block insertion
- **Floating Toolbar**: Text selection formatting
- **Clean Typography**: Notion-like styling
- **Smooth Animations**: Fade-in effects

### 🎨 Editor Capabilities

- **Headings**: H1, H2, H3
- **Lists**: Bullet and numbered lists
- **Code**: Inline and block code
- **Links & Images**: Rich media support
- **Tables**: Basic table insertion
- **Blockquotes**: Quote blocks
- **Horizontal Rules**: Dividers

## Usage

```tsx
import ContentWorkspace from "@/components/ai/ContentWorkspace";

<ContentWorkspace
  idea={idea}
  clips={clips}
  compactMode={false}
  dedicatedPage={true}
/>;
```

## Development

### Adding New Editor Features

1. Add TipTap extensions in `components/Editor/TipTap/TipTapEditorComplete.tsx`
2. Add slash commands in `components/Editor/TipTap/SlashCommandMenu.tsx`
3. Add floating toolbar options in `components/Editor/TipTap/FloatingToolbar.tsx`

### Styling

- Main workspace styles: `styles/content-workspace.css`
- Editor styles: `components/Editor/styles/`
- TipTap styles: `components/Editor/TipTap/styles.css`

### File Naming Conventions

- Components: PascalCase (e.g., `ContentHeader.tsx`)
- Styles: kebab-case (e.g., `content-workspace.css`)
- Folders: PascalCase for components, lowercase for utilities
