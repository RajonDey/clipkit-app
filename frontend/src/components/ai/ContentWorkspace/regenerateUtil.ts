// Add a method to handle regeneration with custom instructions
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
