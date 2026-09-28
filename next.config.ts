import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75],
    // Instagram's CDN blocks cross-origin <img> loads, so images go through the
    // Next optimizer, which fetches them server-side (and resizes them).
    remotePatterns: [
      { hostname: "**.cdninstagram.com", protocol: "https" },
      { hostname: "**.fbcdn.net", protocol: "https" },
      // Mock provider placeholders.
      { hostname: "picsum.photos", protocol: "https" },
      { hostname: "fastly.picsum.photos", protocol: "https" },
    ],
  },
};

export default nextConfig;
