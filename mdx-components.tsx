import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <div className="p-8">
        {/* This adds padding to the entire MDX content */}
        {children}
      </div>
    ),

    h1: ({ children }) => (
      <h1
        className="font-serif font-bold italic"
        style={{
          paddingBottom: "1rem",
          paddingTop: "0.5rem",
          fontSize: "5rem",
          lineHeight: 1.05,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="font-serif font-bold italic"
        style={{
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          fontSize: "3rem",
          lineHeight: 1,
        }}
      >
        {children}
      </h2>
    ),

    ...components,
  };
}
