import { handleApiRequest } from "./api/handler";

export async function handleRequest(request: Request) {
  const url = new URL(request.url);

  // Handle API routes
  if (url.pathname.startsWith("/api/")) {
    return handleApiRequest(request);
  }

  // Pass through all other requests
  return fetch(request);
}
