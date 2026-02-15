import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // <-- important pour que le build pointe vers les bons fichiers
  build: {
    outDir: "dist", // normalement déjà par défaut
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});

