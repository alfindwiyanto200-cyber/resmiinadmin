import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Ignore build errors during development when DB is not connected
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
