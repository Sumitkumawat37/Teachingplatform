import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Charts
          if (id.includes('recharts')) {
            return 'charts';
          }
          // Framer Motion
          if (id.includes('framer-motion')) {
            return 'framer';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'date';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    cssCodeSplit: true,
  },
}));
