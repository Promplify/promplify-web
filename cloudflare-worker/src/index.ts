import { createClient } from "@supabase/supabase-js";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Only handle GET requests
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse URL and parameters
    const url = new URL(request.url);
    const promptId = url.pathname.split("/").pop();
    const version = url.searchParams.get("version");

    // Validate promptId
    if (!promptId) {
      return new Response("Prompt ID is required", { status: 400 });
    }

    // Get Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Authorization header is required", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      console.log("Initializing Supabase client with URL:", env.SUPABASE_URL);
      // Initialize Supabase client
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // 1. Verify token
      console.log("Verifying token");
      const { data: apiToken, error: tokenError } = await supabase.from("api_tokens").select("id").eq("token", token).single();

      if (tokenError || !apiToken) {
        console.error("Token verification failed:", tokenError);
        return new Response("Invalid token", { status: 401 });
      }

      // 2. Query prompt
      console.log("Querying prompt with ID:", promptId);
      let query = supabase
        .from("prompts")
        .select(
          `
          title,
          description,
          content,
          version,
          token_count,
          performance,
          is_favorite,
          model,
          temperature,
          max_tokens,
          created_at,
          updated_at,
          system_prompt,
          user_prompt,
          system_tokens,
          user_tokens
        `
        )
        .eq("id", promptId);

      // If version is specified, query specific version
      if (version) {
        query = query.eq("version", version);
      } else {
        // Otherwise get the latest version
        query = query.order("version", { ascending: false });
      }

      const { data: prompt, error: promptError } = await query.limit(1).single();

      if (promptError) {
        console.error("Prompt query error:", promptError);
        if (promptError.code === "PGRST116") {
          return new Response(version ? `Prompt version ${version} not found` : "Prompt not found", { status: 404 });
        }
        throw promptError;
      }

      if (!prompt) {
        console.log("No prompt found for ID:", promptId);
        return new Response(version ? `Prompt version ${version} not found` : "Prompt not found", { status: 404 });
      }

      // 3. Update token last used time
      await supabase.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", token);

      console.log("Successfully found prompt:", prompt);
      // Return prompt content
      return new Response(JSON.stringify(prompt), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: unknown) {
      console.error("Detailed error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(`Internal Server Error: ${errorMessage}`, { status: 500 });
    }
  },
};
