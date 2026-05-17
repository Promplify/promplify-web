type AnalyticsEventName = "sign_up" | "login" | "create_prompt" | "use_template" | "share_prompt" | "create_api_token";

type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: AnalyticsEventName, params?: Record<string, string | number | boolean>) => void;
  }
}

const allowedParams: Record<AnalyticsEventName, Set<string>> = {
  sign_up: new Set(["method"]),
  login: new Set(["method"]),
  create_prompt: new Set(["source"]),
  use_template: new Set(["source", "template_id", "category"]),
  share_prompt: new Set(["surface"]),
  create_api_token: new Set(["surface"]),
};

const normalizeValue = (value: AnalyticsValue) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "boolean" || typeof value === "number") return value;

  return value.slice(0, 80);
};

export const trackEvent = (eventName: AnalyticsEventName, params: AnalyticsParams = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const allowlist = allowedParams[eventName];
  const eventParams = Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (!allowlist.has(key)) return acc;

    const normalizedValue = normalizeValue(value);
    if (normalizedValue === undefined) return acc;

    acc[key] = normalizedValue;
    return acc;
  }, {});

  window.gtag("event", eventName, eventParams);
};
