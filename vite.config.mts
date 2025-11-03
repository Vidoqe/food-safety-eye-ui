
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./scr"), // ✅ your actual folder name
    },
  },

  server: {
    port: 3000,
  },

  build: {
    copyPublicDir: true, // ✅ include public/ in build
    target: "esnext",    // ✅ allow top-level await
  },
});
