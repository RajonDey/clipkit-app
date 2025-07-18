import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "source.unsplash.com",
      "picsum.photos",
      "preview--arya-digestive-web-69.lovable.app",
      "i.imgur.com",
      "images.unsplash.com",
      "cdn.pixabay.com",
      "storage.googleapis.com",
      "s3.amazonaws.com",
      "res.cloudinary.com",
    ],
    // Use remotePatterns for more advanced patterns
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.lovable.app",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
    // This allows base64 encoded images as a fallback
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
