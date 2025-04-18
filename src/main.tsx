import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry
Sentry.init({
  dsn: "https://792b1d5e0b71fc2444800289dd48bd9b@o4504698557693952.ingest.us.sentry.io/4509172418084864",
  integrations: [],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample rate at 10%
  replaysOnErrorSampleRate: 1.0, // Capture all sessions where errors occur
});

createRoot(document.getElementById("root")!).render(<App />);
