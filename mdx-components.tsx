import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <div className="p-8">{children}</div>,

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
    ul: ({ children }) => (
      <ul
        style={{
          listStyleType: "disc",
          paddingLeft: "2rem",
          marginBottom: "1rem",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          listStyleType: "decimal",
          paddingLeft: "2rem",
          marginBottom: "1rem",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li
        style={{
          fontSize: "1rem",
          lineHeight: 1.6,
          marginBottom: "0.5rem",
        }}
      >
        {children}
      </li>
    ),

    ...components,
  };
}
