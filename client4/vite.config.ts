import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // POST /assistant/sse-proxy  ->  POST http://localhost:8000/assistant/stream (SSE)
      "/assistant/sse-proxy": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // keep the POST body and just rewrite the path:
        rewrite: (p) => p.replace(/^\/assistant\/sse-proxy$/, "/assistant/stream"),
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            // Ensure proper SSE headers come through for the browser
            proxyRes.headers["Cache-Control"] = "no-cache";
            proxyRes.headers["Connection"] = "keep-alive";
            // Don't force content-type if backend already sets it; only set as fallback:
            if (!proxyRes.headers["content-type"]) {
              proxyRes.headers["Content-Type"] = "text/event-stream";
            }
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
