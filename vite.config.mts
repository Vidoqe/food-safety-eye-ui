<<<<<<< HEAD
// vite.config.mts
import { defineConfig } from "vite";
=======
﻿import { defineConfig } from "vite";
>>>>>>> aaff610 (wip: save local changes bfore rebase)
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
<<<<<<< HEAD
      "@": path.resolve(__dirname, "./scr"), // <-- point to scr
    },
  },
  server: {
    port: 3000, // optional
=======
      "@": resolve(__dirname, "./scr") // point "@" to your scr folder
    }
>>>>>>> aaff610 (wip: save local changes bfore rebase)
  },
  server: { port: 3000 } // optional for local dev
});
