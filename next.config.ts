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
    unoptimized: false, // Set to false to enable image optimization unless explicitly needed
    domains: [], // Add allowed image domains if using external images
  },
};

export default nextConfig;
