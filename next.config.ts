import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard is fully user-specific and reads auth cookies on every
  // request, so component caching / prerendering is disabled.
  cacheComponents: false,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
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
