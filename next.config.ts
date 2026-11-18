import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Hide the dev-only indicator so it doesn't overlap the floating Review-tools button.
  devIndicators: false,
  typescript: {
    // CI validates separately; skip in-image typecheck to keep the builder small.
    ignoreBuildErrors: process.env.NEXT_BUILD_SKIP_TYPECHECK === "1",
  },
};

export default nextConfig;
