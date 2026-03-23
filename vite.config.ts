import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const plugins = [react()];

  // Try to load optional Replit plugins & runtime overlay only if available.
  const runtimeOverlayModule = await import("@replit/vite-plugin-runtime-error-modal").catch(() => null);
  if (runtimeOverlayModule) {
    const runtimeOverlay = runtimeOverlayModule.default || runtimeOverlayModule;
    if (typeof runtimeOverlay === "function") plugins.push(runtimeOverlay());
  }

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const cartographerModule = await import("@replit/vite-plugin-cartographer").catch(() => null);
      const devBannerModule = await import("@replit/vite-plugin-dev-banner").catch(() => null);
      if (cartographerModule && cartographerModule.cartographer) plugins.push(cartographerModule.cartographer());
      if (devBannerModule && devBannerModule.devBanner) plugins.push(devBannerModule.devBanner());
    } catch {}
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
