// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/scr",          // ← was '/src'
    },
  },
  build: {
    target: "esnext",
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
