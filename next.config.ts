import type { NextConfig } from "next";

const INTERNAL_BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      { source: "/video_feed", destination: `${INTERNAL_BACKEND_URL}/video_feed` },
      { source: "/stats", destination: `${INTERNAL_BACKEND_URL}/stats` },
      { source: "/toggle", destination: `${INTERNAL_BACKEND_URL}/toggle` },
      { source: "/camera/:path*", destination: `${INTERNAL_BACKEND_URL}/camera/:path*` },
      { source: "/health", destination: `${INTERNAL_BACKEND_URL}/health` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
