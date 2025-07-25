# ClipKit Integration Guide

This document provides instructions on how to integrate the Notion-like editor and content persistence features into your ClipKit application.

## 1. Integrating TipTap Editor

Replace the simple textarea in your Editor component with the TipTap editor:

```tsx
// In Editor/index.tsx
{
  isEditing ? (
    <TipTapEditor
      content={editedContent}
      setContent={setEditedContent}
      availableClips={availableClips}
    />
  ) : (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {content}
    </ReactMarkdown>
  );
}
```

## 2. Content Persistence

The persistence functionality is implemented using localStorage. Add these useEffect hooks to your ContentWorkspace component:

```tsx
// Load saved content from localStorage on mount
React.useEffect(() => {
  const savedContent = localStorage.getItem(`clipkit-content-${idea.id}`);
  if (savedContent) {
    setGeneratedContent(savedContent);
  }
}, [idea.id]);

// Save content to localStorage when it changes
React.useEffect(() => {
  if (generatedContent) {
    localStorage.setItem(`clipkit-content-${idea.id}`, generatedContent);
  }
}, [generatedContent, idea.id]);
```

## 3. Regenerate with Custom Instructions

Add the regenerate functionality to your ContentWorkspace component:

```tsx
const handleRegenerate = async (instructions: string) => {
  setIsGenerating(true);
  setErrorMessage("");

  try {
    // Check for token
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("You must be logged in to regenerate content.");
      setIsGenerating(false);
      return;
    }

    // Import API dynamically
    const { content } = await import("@/lib/api");

    // Call the API with custom instructions
    const response = await content.generate({
      idea_id: idea.id,
      clip_ids: orderedClips
        .filter((clip) => selectedClipIds.includes(clip.id))
        .map((clip) => clip.id),
      content_type: params.contentType,
      tone: params.tone,
      length: params.length,
      custom_instructions: instructions, // Add custom instructions
    });

    setGeneratedContent(response.content);
  } catch (error) {
    console.error("Error regenerating content:", error);
    setErrorMessage("Failed to regenerate content. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

// Then pass this to your Editor component
<Editor
  // ...other props
  ideaId={idea.id}
  onRegenerate={handleRegenerate}
/>;
```

## 4. API Update

Update your API client to accept custom instructions:

```typescript
// In your api.ts or similar file
export interface ContentGenerationRequest {
  idea_id: string;
  clip_ids: string[];
  content_type: string;
  tone: string;
  length: string;
  custom_instructions?: string; // Add this parameter
}

const generate = async (params: ContentGenerationRequest) => {
  const response = await axios.post<ContentGenerationResponse>(
    `${API_BASE}/content/generate`,
    params,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};
```

## 5. Using the Complete Editor

For a completely working solution, you can use the EditorComplete.tsx component:

```tsx
// In your ContentWorkspace component
import Editor from "./Editor/EditorComplete";

// ...

return (
  <div className="flex flex-col h-full">
    <ContentHeader />
    <ParametersSection
      params={params}
      setParams={setParams}
      onGenerate={handleGenerateContent}
      isGenerating={isGenerating}
      errorMessage={errorMessage}
    />
    <ClipSelection
      clips={filteredClips}
      selectedClipIds={selectedClipIds}
      toggleClipSelection={toggleClipSelection}
      activeFilter={activeFilter}
      setActiveFilter={setActiveFilter}
      draggedClip={draggedClip}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragEnd={handleDragEnd}
      onPreview={(clip) => setPreviewClip(clip)}
    />
    <Editor
      content={generatedContent}
      setContent={setGeneratedContent}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editedContent={editedContent}
      setEditedContent={setEditedContent}
      showExportMenu={showExportMenu}
      setShowExportMenu={setShowExportMenu}
      availableClips={orderedClips}
      ideaId={idea.id}
      onRegenerate={handleRegenerate}
    />
    {previewClip && <MediaPreview clip={previewClip} onClose={closePreview} />}
  </div>
);
```

## Next Steps

1. Implement backend support for custom instructions
2. Add more TipTap extensions for additional features
3. Enhance the UI for a more Notion-like experience
4. Add collaborative editing features
