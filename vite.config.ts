import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "gugudata",
      project: "promplify",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react-syntax-highlighter"],
  },
}));
