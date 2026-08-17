import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    domains: [
      "images.unsplash.com",
      "illustrations.popsy.co",
      "api.dicebear.com",
      "res.cloudinary.com",
      "raw.githubusercontent.com",
    ],
  },
};

export default nextConfig;
