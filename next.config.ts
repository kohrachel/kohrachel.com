import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Optionally, import remark/rehype plugins if you want to use them
// import remarkGfm from 'remark-gfm';

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
