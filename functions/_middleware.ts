const CANONICAL_HOST = "promplify.com";
const APP_SHELL_PATHS = new Set(["/auth", "/reset-password", "/dashboard", "/profile"]);
const APP_SHELL_PREFIXES = ["/auth/", "/template/", "/share/", "/discover/prompt/"];

export const isAppShellPath = (pathname: string) =>
  APP_SHELL_PATHS.has(pathname) || APP_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  if (isAppShellPath(url.pathname)) {
    url.pathname = "/";
    url.search = "";
    return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
  }

  return context.next();
};
