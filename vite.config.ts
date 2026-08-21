import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const shouldUploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  build: {
    sourcemap: shouldUploadSourceMaps ? "hidden" : false,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    ...(shouldUploadSourceMaps
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "gugudata",
            project: "promplify",
            telemetry: false,
            sourcemaps: {
              filesToDeleteAfterUpload: "./dist/**/*.map",
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
