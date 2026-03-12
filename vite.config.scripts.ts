import { defineConfig } from "vite";
import { resolve } from "path";
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "fs";

// Build content script + background service worker as self-contained IIFE bundles.
// This is step 1 of the build — it also copies manifest, icons, and content styles.
function copyStaticAssets() {
  return {
    name: "copy-static-assets",
    writeBundle() {
      const distDir = resolve(__dirname, "dist");

      // Copy manifest.json
      const manifest = JSON.parse(
        readFileSync(resolve(__dirname, "src/manifest.json"), "utf-8"),
      );
      writeFileSync(
        resolve(distDir, "manifest.json"),
        JSON.stringify(manifest, null, 2),
      );

      // Copy icons
      const iconsDir = resolve(distDir, "icons");
      if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
      const srcIcons = resolve(__dirname, "src/icons");
      if (existsSync(srcIcons)) {
        for (const file of ["icon16.png", "icon48.png", "icon128.png"]) {
          const src = resolve(srcIcons, file);
          if (existsSync(src)) copyFileSync(src, resolve(iconsDir, file));
        }
      }

      // Copy content styles
      const assetsDir = resolve(distDir, "assets");
      if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
      copyFileSync(
        resolve(__dirname, "src/content/styles.css"),
        resolve(assetsDir, "content-styles.css"),
      );
    },
  };
}

export default defineConfig({
  plugins: [copyStaticAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: {
        content: resolve(__dirname, "src/content/index.ts"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        // No code splitting — inline everything
        inlineDynamicImports: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
