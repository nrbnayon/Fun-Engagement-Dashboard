// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Set to false to catch build errors
  },
  images: {
    unoptimized: false, // Keep image optimization enabled
    // Allow images from any external domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // Allows all HTTP domains
      },
    ],
  },
};

export default nextConfig;
