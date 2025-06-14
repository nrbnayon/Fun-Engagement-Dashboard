// next.config.ts;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // webpack: (config: any) => {
  //   config.optimization.splitChunks = {
  //     chunks: "all",
  //   };
  //   return config;
  // },
};

export default nextConfig;
