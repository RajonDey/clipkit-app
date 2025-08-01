import React, { useState } from "react";
import Image from "next/image";
import { ClipType, ContentTypeOption } from "@/types/idea";
import { buttonStyles, inputStyles } from "@/styles/tokens";
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  createYouTubeEmbedUrl,
} from "@/lib/videoUtils";

interface AddClipModalProps {
  contentTypes: ContentTypeOption[];
  onAddClip: (type: ClipType, content: string, tag: string) => void;
  onClose: () => void;
}

interface ClipContent {
  text: string;
  link: string;
  image: string;
  video: string;
  code: string;
}

/**
 * Modal component for adding a new clip with tabs for different content types
 */
export const AddClipModal: React.FC<AddClipModalProps> = ({
  contentTypes,
  onAddClip,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ClipType>("text");
  // Store separate content for each tab type
  const [clipContents, setClipContents] = useState<ClipContent>({
    text: "",
    link: "",
    image: "",
    video: "",
    code: "",
  });
  const [tag, setTag] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("js");

  // For image preview validation
  const [isImageValid, setIsImageValid] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentContent = clipContents[activeTab];
    if (!currentContent.trim()) return;

    const finalContent = currentContent;

    // For code clips, we might want to store the language info
    // if (activeTab === "code") {
    //   Add language info if needed in the future
    // }

    onAddClip(activeTab, finalContent, tag);
    onClose();
  };

  // Handle content change for any tab
  const handleContentChange = (value: string) => {
    setClipContents({
      ...clipContents,
      [activeTab]: value,
    });

    // Validate image URL when in image tab
    if (activeTab === "image") {
      try {
        // Only set valid if it's a non-empty URL
        if (value.trim()) {
          new URL(value); // This will throw if invalid
          setIsImageValid(true);
        } else {
          setIsImageValid(false);
        }
      } catch {
        setIsImageValid(false);
      }
    }
  };

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (url: string) => {
    if (!url) return "";
    try {
      // For URLs from domains we know are configured in next.config.ts, use them directly
      const urlObj = new URL(url);
      const knownDomains = [
        "source.unsplash.com",
        "picsum.photos",
        "i.imgur.com",
        "images.unsplash.com",
        "cdn.pixabay.com",
      ];

      // If the domain is known, use the image directly
      if (knownDomains.includes(urlObj.hostname)) {
        return url;
      }

      // Otherwise, use our proxy
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    } catch {
      return "";
    }
  };

  // Check if URL is valid
  const isValidUrl = (url: string) => {
    try {
      if (!url.trim()) return false;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Check if image URL is valid for preview
  const isValidImageUrl = () => isValidUrl(clipContents.image);

  // Check if video URL is valid
  const isValidVideoUrl = () => isValidUrl(clipContents.video);

  // Check if link URL is valid
  const isValidLinkUrl = () => isValidUrl(clipContents.link);

  // Check if current content is valid for submission
  const isCurrentContentValid = () => {
    const content = clipContents[activeTab].trim();
    if (!content) return false;

    // For URLs, validate they're proper URLs
    if (
      activeTab === "image" ||
      activeTab === "video" ||
      activeTab === "link"
    ) {
      return isValidUrl(content);
    }

    // For text and code, just check if there's content
    return true;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "text":
        return (
          <textarea
            className={`${inputStyles.default} ${inputStyles.focus} ${inputStyles.textArea} w-full`}
            placeholder="Write your note here..."
            value={clipContents.text}
            onChange={(e) => handleContentChange(e.target.value)}
            autoFocus
          />
        );
      case "link":
        return (
          <div className="space-y-2">
            <input
              type="url"
              className={`${inputStyles.default} ${inputStyles.focus} w-full ${
                !isValidLinkUrl() && clipContents.link.trim()
                  ? "border-red-300"
                  : ""
              }`}
              placeholder="https://..."
              value={clipContents.link}
              onChange={(e) => handleContentChange(e.target.value)}
              autoFocus
            />
            {clipContents.link.trim() && !isValidLinkUrl() && (
              <div className="text-xs text-red-500 mt-1">
                Please enter a valid URL (starting with http:// or https://)
              </div>
            )}
            {isValidLinkUrl() && (
              <div className="text-xs text-green-600 mt-1">URL is valid ✓</div>
            )}
          </div>
        );
      case "image":
        return (
          <div className="space-y-4">
            <input
              type="url"
              className={`${inputStyles.default} ${inputStyles.focus} w-full ${
                !isValidImageUrl() && clipContents.image.trim()
                  ? "border-red-300"
                  : ""
              }`}
              placeholder="https://... (image URL)"
              value={clipContents.image}
              onChange={(e) => handleContentChange(e.target.value)}
              autoFocus
            />
            {clipContents.image.trim() && !isValidImageUrl() && (
              <div className="text-xs text-red-500 mt-1">
                Please enter a valid image URL (starting with http:// or
                https://)
              </div>
            )}
            {isValidImageUrl() && (
              <div className="mt-2 border rounded overflow-hidden max-h-40 flex items-center justify-center relative">
                <div
                  style={{
                    height: "160px",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {/* Now using Next.js Image with our proxy for any domain */}
                  <Image
                    src={getProxiedImageUrl(clipContents.image)}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                    onError={() => {
                      setIsImageValid(false);
                      // We won't see this error unless there's an actual problem loading the image
                      console.error("Failed to load image preview");
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="space-y-4">
            <input
              type="url"
              className={`${inputStyles.default} ${inputStyles.focus} w-full ${
                !isValidVideoUrl() && clipContents.video.trim()
                  ? "border-red-300"
                  : ""
              }`}
              placeholder="https://... (video URL)"
              value={clipContents.video}
              onChange={(e) => handleContentChange(e.target.value)}
              autoFocus
            />
            {clipContents.video.trim() && !isValidVideoUrl() && (
              <div className="text-xs text-red-500 mt-1">
                Please enter a valid video URL (starting with http:// or
                https://)
              </div>
            )}
            {isValidVideoUrl() && (
              <div className="mt-2">
                <div className="text-xs text-green-600 mb-2">
                  {isYouTubeUrl(clipContents.video)
                    ? "YouTube video URL detected ✓"
                    : "Video URL is valid ✓"}
                </div>
                {isYouTubeUrl(clipContents.video) && (
                  <div className="border rounded overflow-hidden aspect-video">
                    <iframe
                      src={createYouTubeEmbedUrl(
                        extractYouTubeVideoId(clipContents.video) || ""
                      )}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title="YouTube video preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "code":
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center mb-2">
              <label className="text-sm text-neutral-500">Language:</label>
              <select
                className="border border-neutral-200 rounded px-2 py-1 text-sm bg-white"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
              >
                <option value="js">JavaScript</option>
                <option value="ts">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell/Bash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <textarea
              className={`${inputStyles.default} ${inputStyles.focus} ${inputStyles.textArea} w-full font-mono text-sm`}
              placeholder="Paste or type your code here..."
              value={clipContents.code}
              onChange={(e) => handleContentChange(e.target.value)}
              autoFocus
              rows={8}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Add explanatory note about behavior
  const renderHelperText = () => {
    // Get the active tab's content length
    const currentContentLength = clipContents[activeTab].trim().length;
    const isContentValid = isCurrentContentValid();

    // Count how many tabs have content
    const tabsWithContent = Object.entries(clipContents).filter(
      ([, content]) => content.trim().length > 0
    ).length;

    return (
      <div className="text-xs mt-1 mb-4">
        <p className="text-neutral-500 font-medium">
          <span className="bg-yellow-100 px-1 py-0.5 rounded text-yellow-800">
            Note:
          </span>{" "}
          Only the content from the{" "}
          <span className="font-bold">currently selected tab</span> will be
          added as a clip.
        </p>

        {tabsWithContent > 1 && (
          <p className="mt-1 text-blue-600 italic">
            You have content in multiple tabs. Switch to each tab and click
            &quot;Add Clip&quot; to add them separately.
          </p>
        )}

        {currentContentLength > 0 && !isContentValid && (
          <p className="mt-1 text-red-600">
            Please provide valid content for this type of clip.
          </p>
        )}

        {isContentValid && (
          <p className="mt-1 text-green-600">
            Your {activeTab} clip is ready to add. Press Add Clip or use
            Ctrl+Enter to submit.
          </p>
        )}
      </div>
    );
  };

  // Add keyboard shortcut for quick submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-8 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Add New Clip
            </h2>
            <p className="text-neutral-500">
              Organize your ideas by adding different types of content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
            title="Close modal"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Clip Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Choose Content Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActiveTab(type.value as ClipType)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activeTab === type.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {type.value === "text" && "📝"}
                      {type.value === "image" && "🖼️"}
                      {type.value === "video" && "🎥"}
                      {type.value === "link" && "🔗"}
                      {type.value === "code" && "💻"}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-neutral-500">
                        {type.value === "text" && "Add text notes and ideas"}
                        {type.value === "image" && "Add images and screenshots"}
                        {type.value === "video" && "Add video links and embeds"}
                        {type.value === "link" &&
                          "Add web links and references"}
                        {type.value === "code" && "Add code snippets"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {activeTab === "text" && "Text Content"}
                {activeTab === "image" && "Image URL"}
                {activeTab === "video" && "Video URL"}
                {activeTab === "link" && "Link URL"}
                {activeTab === "code" && "Code Snippet"}
              </label>
              {renderTabContent()}
            </div>

            {/* Tag Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tag (optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., research, inspiration, todo"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Helper Text */}
            {renderHelperText()}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between p-8 border-t border-neutral-200 bg-neutral-50">
          <div className="text-sm text-neutral-500">
            {activeTab === "text" && "📝 Add your thoughts, notes, or ideas"}
            {activeTab === "image" && "🖼️ Paste an image URL to include it"}
            {activeTab === "video" && "🎥 Add YouTube or other video links"}
            {activeTab === "link" && "🔗 Save important web references"}
            {activeTab === "code" && "💻 Store code snippets and examples"}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isCurrentContentValid()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isCurrentContentValid()
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Add Clip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
