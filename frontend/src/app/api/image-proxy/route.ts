import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

/**
 * This API route serves as a proxy for images from any domain
 * It allows displaying images in the Next.js Image component without having to
 * add every possible domain to the Next.js config
 */
export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing image URL", { status: 400 });
  }

  try {
    // Validate the URL to prevent abuse
    new URL(imageUrl);

    // Fetch the image
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return new Response("Failed to fetch image", { status: imageRes.status });
    }

    // Get the image data and content type
    const imageData = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";

    // Return the image with appropriate headers
    return new Response(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Error processing image", { status: 500 });
  }
}
