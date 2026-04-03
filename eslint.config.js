import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".cache/",
      "server/public/",
      "*.cjs",
      "node-orchestrator.js",
      "scripts/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow unused vars prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow `any` in existing code (too many to fix at once)
      "@typescript-eslint/no-explicit-any": "off",
      // Allow require() in config files
      "@typescript-eslint/no-require-imports": "off",
      // Allow empty catch blocks (common pattern)
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
);
