import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables the `use cache` directive, `cacheTag`, and `cacheLife`.
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/bluebook/:path*",
        has: [{ type: "host", value: "(www\\.)?kohrachel\\.com" }],
        destination: "https://bluebook.kohrachel.com/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // Serve bluebook.* from the /bluebook routes. Runs before the filesystem
      // so it can override the main site's pages on that host.
      beforeFiles: [
        {
          source: "/:path((?!_next/|favicon\\.ico$).*)",
          has: [{ type: "host", value: "bluebook\\..*" }],
          destination: "/bluebook/:path",
        },
      ],
    };
  },
};

export default nextConfig;
