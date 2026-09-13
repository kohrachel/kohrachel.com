import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Vendored Tiptap "simple editor" template code. It works at runtime but
  // isn't authored against the newer react-hooks (React Compiler) rules from
  // eslint-config-next 16. Silence those specific rules so we can still update
  // from Tiptap without churn; other lint rules stay active.
  {
    files: [
      "src/components/tiptap-icons/**",
      "src/components/tiptap-ui/**",
      "src/components/tiptap-ui-primitive/**",
      "src/components/tiptap-node/**",
      "src/components/tiptap-extension/**",
      "src/components/tiptap-templates/**",
      "src/hooks/**",
      "src/lib/tiptap-utils.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
    },
  },
]);

export default eslintConfig;
