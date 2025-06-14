import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config: any) => {
    config.optimization.splitChunks = {
      chunks: "all",
    };
    return config;
  },
};

export default nextConfig;
