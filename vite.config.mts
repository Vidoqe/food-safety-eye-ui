
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./scr"),
    },
  },
  server: { port: 3000 },
  build: {
  copyPublicDir: true, // ✅ ensures public/ is included in build
  target: "esnext",    // ✅ allow top-level await & modern syntax
},
