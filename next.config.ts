import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables the `use cache` directive, `cacheTag`, and `cacheLife`.
  cacheComponents: true,
  experimental: {
    // Post images are up to 5MB (POST_IMAGE_MAX_BYTES), plus multipart overhead.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
