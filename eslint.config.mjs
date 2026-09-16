import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
