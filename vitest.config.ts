import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./client/src/test-setup.ts"],
    environmentMatchGlobs: [["server/**", "node"]],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      include: ["client/src/**", "server/**", "shared/**"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/test-setup.ts"],
      thresholds: {
        lines: 30,
        functions: 20,
        branches: 20,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
});
