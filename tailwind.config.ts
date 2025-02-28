import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
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
