import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure API routes are properly handled
  experimental: {
    // This ensures route handlers work correctly
  },
};

export default nextConfig;


