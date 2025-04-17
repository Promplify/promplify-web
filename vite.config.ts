import react from "@vitejs/plugin-react-swc";
import type { ServerResponse } from "http";
import { componentTagger } from "lovable-tagger";
import path from "path";
import type { Connect } from "vite";
import { defineConfig } from "vite";
import { handleRequest } from "./src/middleware";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        configure: (proxy, options) => {
          proxy.on("proxyReq", async (_, req: Connect.IncomingMessage, res: ServerResponse) => {
            if (req.url?.startsWith("/api/")) {
              const request = new Request(`http://localhost:8080${req.url}`, {
                method: req.method || "GET",
                headers: Object.entries(req.headers).reduce((acc, [key, value]) => {
                  if (value) acc[key] = Array.isArray(value) ? value[0] : value;
                  return acc;
                }, {} as Record<string, string>),
              });

              try {
                const response = await handleRequest(request);
                const data = await response.json();

                res.setHeader("Content-Type", "application/json");
                res.statusCode = response.status;
                res.end(JSON.stringify(data));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "Internal server error" }));
              }
            }
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
