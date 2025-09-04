import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./scr"), // use "scr" since that's your folder
    },
  },
  server: {
    port: 3000, // optional for local dev
  },
});