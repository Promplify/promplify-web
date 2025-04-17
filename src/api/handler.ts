import { generateApiToken } from "../lib/api-auth";
import { supabase } from "../lib/supabase";
import { getPrompt } from "./prompts";

export async function handleApiRequest(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Extract token from Authorization header
  const authToken = request.headers.get("Authorization");

  // Handle /api/prompts/:id route
  if (path.startsWith("/api/prompts/")) {
    const promptId = path.split("/").pop();
    if (!promptId) {
      return new Response(JSON.stringify({ error: "Invalid prompt ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "GET") {
      const result = await getPrompt(promptId, undefined, authToken || undefined);

      // Set appropriate status code based on result
      let status = 200;
      if (result.error) {
        switch (result.error) {
          case "Missing authorization token":
          case "Invalid token format":
          case "Invalid API token":
          case "Unauthorized":
          case "API token expired":
            status = 401;
            break;
          case "Prompt not found":
            status = 404;
            break;
          default:
            status = 500;
        }

        return new Response(JSON.stringify({ error: result.error }), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle /api/tokens route
  if (path === "/api/tokens") {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle GET request to fetch tokens
      if (method === "GET") {
        const { data, error } = await supabase.from("api_tokens").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: "Failed to fetch tokens" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle POST request to create token
      if (method === "POST") {
        const body = await request.json();
        const { name } = body;

        if (!name) {
          return new Response(JSON.stringify({ error: "Token name is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { token, error } = await generateApiToken(session.user.id, name);
        if (error) {
          return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ token }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle /api/tokens/:id route for token deletion
  if (path.startsWith("/api/tokens/") && method === "DELETE") {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const tokenId = path.split("/").pop();
      if (!tokenId) {
        return new Response(JSON.stringify({ error: "Invalid token ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify the token belongs to the user
      const { data: token, error: fetchError } = await supabase.from("api_tokens").select("user_id").eq("id", tokenId).single();

      if (fetchError || !token) {
        return new Response(JSON.stringify({ error: "Token not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (token.user_id !== session.user.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Delete the token
      const { error: deleteError } = await supabase.from("api_tokens").delete().eq("id", tokenId);

      if (deleteError) {
        return new Response(JSON.stringify({ error: "Failed to delete token" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
