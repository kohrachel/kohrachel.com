import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Surface non-canonical / unnecessary arbitrary Tailwind classes as warnings
  // (e.g. `duration-[0.5s]` -> `duration-500`).
  tailwindcss.configs.recommended,
  {
    settings: {
      tailwindcss: {
        // Tailwind v4 entry stylesheet used to resolve the theme.
        cssConfigPath: "src/app/globals.css",
      },
    },
    rules: {
      // Custom utility classes (bookThreeD, bookMetaText, ...) are intentional.
      "tailwindcss/no-custom-classname": "off",
      // Leave class ordering to Prettier / manual authoring.
      "tailwindcss/classnames-order": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/tiptap/**",
    "src/components/theme-provider.tsx",
  ]),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/supabase-js", "@supabase/*"],
              message:
                "Import storage via '@/services/storage' instead. The Supabase SDK is only allowed in src/services/storage/* (see docs/storage-and-auth-plan.md §A8).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/services/storage/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);

export default eslintConfig;
