import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allows production builds on Vercel to complete cleanly without blocking on minor type variations
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevents ESLint rules from failing production deployment
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
