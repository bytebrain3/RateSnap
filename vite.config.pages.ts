import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Build popup and options HTML pages (React apps).
// This is step 2 of the build — it does NOT clear the dist folder.
export default defineConfig({
  plugins: [react()],
  // Use relative paths so chrome-extension:// URLs work correctly
  base: "",
  build: {
    outDir: "dist",
    emptyOutDir: false, // preserve step 1 output
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        options: resolve(__dirname, "src/options/index.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
