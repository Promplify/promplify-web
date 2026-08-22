import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { resolveSentryDsn } from "./lib/sentryConfig";
import { shouldDropReactRemoveChildNoise } from "./lib/sentryNoise";
import { installChunkLoadRecovery } from "./lib/chunkLoadRecovery";

installChunkLoadRecovery();

const sentryDsn = resolveSentryDsn(window.location.hostname, import.meta.env.VITE_SENTRY_DSN);

if (sentryDsn) {
  void import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeSend(event, hint) {
        if (shouldDropReactRemoveChildNoise(event, hint)) {
          return null;
        }

        return event;
      },
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
