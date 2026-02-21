import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ⭐ THIS activates Tailwind v4 inside Vite
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // 🔥 your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    allowedHosts: true, // Allows all hosts
  },
});
