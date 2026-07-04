/**
 * Vite configuration for the AccessAI React frontend.
 *
 * - React Fast Refresh via @vitejs/plugin-react
 * - Path alias `@` → /src for cleaner imports
 * - Dev server proxies API requests to the FastAPI backend on port 8000
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite dev proxy bypass — let the SPA handle GET navigations to auth pages.
 * Only non-HTML requests (e.g. axios POST) are forwarded to FastAPI.
 */
function apiProxy(target) {
  return {
    target,
    changeOrigin: true,
    bypass(req) {
      const accept = req.headers.accept || "";
      if (req.method === "GET" && accept.includes("text/html")) {
        return req.url;
      }
    },
  };
}

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      // Proxy REST API calls to FastAPI during development
      "/chat": apiProxy("http://127.0.0.1:8000"),
      "/history": apiProxy("http://127.0.0.1:8000"),
      "/login": apiProxy("http://127.0.0.1:8000"),
      "/signup": apiProxy("http://127.0.0.1:8000"),
      "/health": apiProxy("http://127.0.0.1:8000"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          markdown: ["react-markdown", "remark-gfm"],
        },
      },
    },
  },
});
