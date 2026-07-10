type AnalyticsEventName =
  | "sign_up"
  | "login"
  | "auth_start"
  | "create_prompt"
  | "update_prompt"
  | "optimize_prompt"
  | "copy_prompt"
  | "use_template"
  | "template_search"
  | "template_open"
  | "template_cta_click"
  | "share_prompt"
  | "copy_share_link"
  | "create_api_token"
  | "copy_api_token";

type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

type TemplateUsageParams = {
  source: "templates" | "template_detail";
  templateId: string | number;
  category?: string | null;
};

type AuthMode = "login" | "register";

type AuthMethod = "email" | "google" | "github";

type PromptSource = "dashboard" | "template" | "template_detail";

type TemplateSearchSurface = "search_input" | "quick_filter" | "use_case" | "popular_search" | "long_tail";

type TemplateCtaTarget = "create_library" | "discover" | "api_docs";

type ShareSurface = "private_link" | "discover" | "template_x" | "template_facebook" | "template_linkedin" | "template_copy_link";

type ApiTokenSurface = "settings";

declare global {
  interface Window {
    gtag?: (command: "event", eventName: AnalyticsEventName, params?: Record<string, string | number | boolean>) => void;
  }
}

const allowedParams: Record<AnalyticsEventName, Set<string>> = {
  sign_up: new Set(["method"]),
  login: new Set(["method"]),
  auth_start: new Set(["mode", "method"]),
  create_prompt: new Set(["source"]),
  update_prompt: new Set(["source"]),
  optimize_prompt: new Set(["source"]),
  copy_prompt: new Set(["source"]),
  use_template: new Set(["source", "template_id", "category"]),
  template_search: new Set(["surface", "query"]),
  template_open: new Set(["source", "template_id", "category"]),
  template_cta_click: new Set(["target"]),
  share_prompt: new Set(["surface"]),
  copy_share_link: new Set(["surface"]),
  create_api_token: new Set(["surface"]),
  copy_api_token: new Set(["surface"]),
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

export const trackSignUp = (method: "email" = "email") => {
  trackEvent("sign_up", { method });
};

export const trackLogin = (method: AuthMethod = "email") => {
  trackEvent("login", { method });
};

export const trackAuthStarted = (mode: AuthMode, method: AuthMethod) => {
  trackEvent("auth_start", { mode, method });
};

export const trackPromptCreated = (source: PromptSource) => {
  trackEvent("create_prompt", { source });
};

export const trackPromptUpdated = (source: "dashboard") => {
  trackEvent("update_prompt", { source });
};

export const trackPromptOptimized = (source: "dashboard") => {
  trackEvent("optimize_prompt", { source });
};

export const trackPromptCopied = (source: "dashboard" | "template_detail") => {
  trackEvent("copy_prompt", { source });
};

export const trackTemplateUsed = ({ source, templateId, category }: TemplateUsageParams) => {
  trackEvent("use_template", {
    source,
    template_id: templateId,
    category: category || "uncategorized",
  });
};

export const trackTemplateSearch = (query: string, surface: TemplateSearchSurface) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return;
  trackEvent("template_search", {
    surface,
    query: normalizedQuery,
  });
};

export const trackTemplateOpened = ({ templateId, category }: { templateId: string | number; category?: string | null }) => {
  trackEvent("template_open", {
    source: "templates",
    template_id: templateId,
    category: category || "uncategorized",
  });
};

export const trackTemplateCtaClicked = (target: TemplateCtaTarget) => {
  trackEvent("template_cta_click", { target });
};

export const trackPromptShared = (surface: ShareSurface) => {
  trackEvent("share_prompt", { surface });
};

export const trackShareLinkCopied = (surface: ShareSurface) => {
  trackEvent("copy_share_link", { surface });
};

export const trackApiTokenCreated = (surface: ApiTokenSurface) => {
  trackEvent("create_api_token", { surface });
};

export const trackApiTokenCopied = (surface: ApiTokenSurface) => {
  trackEvent("copy_api_token", { surface });
};
