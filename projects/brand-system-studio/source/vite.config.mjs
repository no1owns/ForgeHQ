import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base: the built index.html references its own assets with
  // "./..." paths instead of root-absolute ones, so the build works
  // unchanged whether it's served from the domain root or nested under
  // /ForgeHQ/projects/brand-system-studio/ on GitHub Pages.
  base: "./",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  plugins: [react()],
});
