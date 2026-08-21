const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeAuthRedirect(value: string | null | undefined): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const parsed = new URL(candidate, "https://promplify.local");
    if (parsed.origin !== "https://promplify.local") {
      return DEFAULT_AUTH_REDIRECT;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export function buildAuthPath(nextPath: string, mode: "login" | "register" = "register"): string {
  const params = new URLSearchParams({
    mode,
    next: getSafeAuthRedirect(nextPath),
  });
  return `/auth?${params.toString()}`;
}

export function buildAuthCallbackUrl(origin: string, nextPath: string): string {
  const params = new URLSearchParams({ next: getSafeAuthRedirect(nextPath) });
  return `${origin}/auth/callback?${params.toString()}`;
}
