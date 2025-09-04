import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./scr"), // ⚠️ keep "scr" since your project uses scr/
    },
  },
  server: {
    port: 3000, // optional for local dev
  },
});
