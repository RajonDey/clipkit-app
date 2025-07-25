import React from "react";
import { buttonStyles, inputStyles } from "@/styles/tokens";
import ContentTypeSelector from "./ContentTypeSelector";

interface ContentGenerationParams {
  contentType: ContentType;
  tone: ToneType;
  length: LengthType;
}

type ContentType =
  | "article"
  | "script"
  | "social"
  | "outline"
  | "email"
  | "blog";
type ToneType =
  | "professional"
  | "casual"
  | "academic"
  | "creative"
  | "persuasive";
type LengthType = "short" | "medium" | "long";

interface ParametersSectionProps {
  params: ContentGenerationParams;
  setParams: React.Dispatch<React.SetStateAction<ContentGenerationParams>>;
  isGenerating: boolean;
  errorMessage: string;
  onGenerate: () => void;
  hasSelectedClips: boolean;
}

const ParametersSection: React.FC<ParametersSectionProps> = ({
  params,
  setParams,
  isGenerating,
  errorMessage,
  onGenerate,
  hasSelectedClips,
}) => {
  // Handle parameter changes
  const handleParamChange = (
    key: keyof ContentGenerationParams,
    value: ContentType | ToneType | LengthType
  ) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="font-medium mb-3">Content Parameters</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-1">
            Content Type
          </label>
          <select
            className={`${inputStyles.default} w-full`}
            value={params.contentType}
            onChange={(e) =>
              handleParamChange("contentType", e.target.value as ContentType)
            }
          >
            <option value="article">Article</option>
            <option value="script">Video Script</option>
            <option value="social">Social Media Post</option>
            <option value="outline">Content Outline</option>
            <option value="email">Email</option>
            <option value="blog">Blog Post</option>
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-1">
            Tone
          </label>
          <select
            className={`${inputStyles.default} w-full`}
            value={params.tone}
            onChange={(e) =>
              handleParamChange("tone", e.target.value as ToneType)
            }
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="academic">Academic</option>
            <option value="creative">Creative</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-neutral-600 mb-1">
            Length
          </label>
          <select
            className={`${inputStyles.default} w-full`}
            value={params.length}
            onChange={(e) =>
              handleParamChange("length", e.target.value as LengthType)
            }
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-4">
        <button
          className={`${buttonStyles.primary} w-full flex items-center justify-center gap-2`}
          onClick={onGenerate}
          disabled={isGenerating || !hasSelectedClips}
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <span className="text-lg">🤖</span>
              Generate Content
            </>
          )}
        </button>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParametersSection;
