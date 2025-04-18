import { createClient } from "@supabase/supabase-js";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 只处理 GET 请求
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 解析 URL 和参数
    const url = new URL(request.url);
    const promptId = url.pathname.split("/").pop();
    const version = url.searchParams.get("version");

    // 验证 promptId
    if (!promptId) {
      return new Response("Prompt ID is required", { status: 400 });
    }

    // 获取 Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Authorization header is required", { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      console.log("Initializing Supabase client with URL:", env.SUPABASE_URL);
      // 初始化 Supabase 客户端
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // 1. 验证 token
      console.log("Verifying token");
      const { data: apiToken, error: tokenError } = await supabase.from("api_tokens").select("id").eq("token", token).single();

      if (tokenError || !apiToken) {
        console.error("Token verification failed:", tokenError);
        return new Response("Invalid token", { status: 401 });
      }

      // 2. 查询 prompt
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

      // 如果指定了版本，查询特定版本
      if (version) {
        query = query.eq("version", version);
      } else {
        // 否则获取最新版本
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

      // 3. 更新 token 的最后使用时间
      await supabase.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", token);

      console.log("Successfully found prompt:", prompt);
      // 返回 prompt 内容
      return new Response(JSON.stringify(prompt), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Detailed error:", error);
      return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
  },
};
