import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Netlify handles serverless functions automatically via @netlify/plugin-nextjs
  // No need to set output: "standalone" — the plugin handles it
  serverExternalPackages: ["sharp", "better-sqlite3"],
  images: {
    // Allow image optimization to work on Netlify
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
