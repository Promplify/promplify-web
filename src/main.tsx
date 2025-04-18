import { browserTracingIntegration } from "@sentry/browser";
import * as Sentry from "@sentry/react";
import { Replay } from "@sentry/replay";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [browserTracingIntegration(), new Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample rate at 10%
  replaysOnErrorSampleRate: 1.0, // Capture all sessions where errors occur
});

createRoot(document.getElementById("root")!).render(<App />);
