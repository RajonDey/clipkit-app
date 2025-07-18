/**
 * Utility functions for handling video URLs
 */

/**
 * Determines if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    );
  } catch {
    return false;
  }
}

/**
 * Extracts a YouTube video ID from a YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    // First, let's try regex patterns to extract video ID
    // This handles all YouTube URL formats including those with additional parameters
    const patterns = [
      // youtu.be/VIDEO_ID
      /youtu\.be\/([^?&]+)/,
      // youtube.com/watch?v=VIDEO_ID
      /youtube\.com\/watch\?v=([^&]+)/,
      // youtube.com/v/VIDEO_ID
      /youtube\.com\/v\/([^?&]+)/,
      // youtube.com/embed/VIDEO_ID
      /youtube\.com\/embed\/([^?&]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If regex patterns fail, try URL parsing as a fallback
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Handle youtu.be format
    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      return urlObj.pathname.slice(1).split("?")[0]; // Remove the leading slash and any query params
    }

    // Handle youtube.com format
    if (hostname === "youtube.com" || hostname === "www.youtube.com") {
      // Get the 'v' parameter from the URL
      const videoId = urlObj.searchParams.get("v");
      return videoId;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Creates a YouTube embed URL from a video ID
 */
export function createYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Gets the appropriate video URL or embed URL based on the content
 */
export function getVideoEmbedUrl(url: string): string {
  if (isYouTubeUrl(url)) {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return createYouTubeEmbedUrl(videoId);
    }
  }
  return url;
}
