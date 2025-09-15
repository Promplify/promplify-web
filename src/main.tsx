import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry (hardcoded DSN per request)
const SENTRY_DSN = "https://792b1d5e0b71fc2444800289dd48bd9b@o4504698557693952.ingest.us.sentry.io/4509172418084864";
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById("root")!).render(<App />);
