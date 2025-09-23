import { codeInspectorPlugin } from "code-inspector-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      rules: codeInspectorPlugin({
        bundler: "turbopack",
        editor: "cursor",
        hotKeys: ["altKey"],
      }),
    },
  },
};

export default nextConfig;
