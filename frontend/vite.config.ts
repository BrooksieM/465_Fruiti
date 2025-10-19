import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173, // Use Vite's default port
    fs: {
      allow: [
        'C:/Users/johns/OneDrive/Desktop/TowerDefense/465_Fruiti/frontend',
        '..',
        '../..'
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your existing backend
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()], // Remove expressPlugin()
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});