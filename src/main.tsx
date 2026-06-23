import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { shouldDropReactRemoveChildNoise } from "./lib/sentryNoise";

// Initialize Sentry (hardcoded DSN per request)
const SENTRY_DSN = "https://792b1d5e0b71fc2444800289dd48bd9b@o4504698557693952.ingest.us.sentry.io/4509172418084864";
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay disabled to avoid consuming reserved replay volume.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend(event, hint) {
    if (shouldDropReactRemoveChildNoise(event, hint)) {
      return null;
    }

    return event;
  },
});

createRoot(document.getElementById("root")!).render(<App />);
