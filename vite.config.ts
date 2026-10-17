import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type UserConfig } from "vite";

const shouldUploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

// https://vitejs.dev/config/
export default defineConfig((): UserConfig => ({
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
