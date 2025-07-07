// next.config.ts
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Optionally, import remark/rehype plugins if you want to use them
// import remarkGfm from 'remark-gfm';

const nextConfig: NextConfig = {
  // Allow .mdx and .md files as pages
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // Add any other Next.js config options here
};

const withMDX = createMDX({
  // To support both .md and .mdx files:
  extension: /\.(md|mdx)$/,
  // Optionally, add remark/rehype plugins:
  // options: {
  //   remarkPlugins: [remarkGfm],
  //   rehypePlugins: [],
  // },
});

// Export the combined config
export default withMDX(nextConfig);
