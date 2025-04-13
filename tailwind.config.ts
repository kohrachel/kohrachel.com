import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          light: "var(--background-light)",
          dark: "var(--background-dark)",
          DEFAULT: "var(--background)",
        },
        foreground: {
          light: "var(--foreground-light)",
          dark: "var(--foreground-dark)",
          DEFAULT: "var(--foreground)",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)"],
        sans: ["var(--font-montserrat)"],
        serif: ["var(--font-eb-garamond)"],
      },
    },
  },
  plugins: [
    require("tailwind-typewriter")({
      wordsets: {
        character: {
          words: ["stranger", "human", "_______"],
          caretColor: "var(--accent)",
          writeSpeed: 0.1,
          pauseBetween: 2,
          repeat: 0,
        },
      },
    }),
  ],
} satisfies Config;
