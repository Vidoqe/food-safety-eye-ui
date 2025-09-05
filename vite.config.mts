
// vite.config.mts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./scr"), // point "@" to scr folder
    },
  },
  server: {
    port: 3000, // optional for local dev
  },
});