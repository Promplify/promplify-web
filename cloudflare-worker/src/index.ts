type ApiPromptRow = {
  status_code: number;
  error_code: string | null;
  title: string | null;
  description: string | null;
  content: string | null;
  version: string | null;
  token_count: number | null;
  performance: number | null;
  is_favorite: boolean | null;
  model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  created_at: string | null;
  updated_at: string | null;
  system_prompt: string | null;
  user_prompt: string | null;
  system_tokens: number | null;
  user_tokens: number | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const extractBearerToken = (authorization: string | null) => {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const parsePromptId = (url: URL) => {
  const match = url.pathname.match(/^\/prompts\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/?$/i);
  return match?.[1] ?? null;
};

const publicPrompt = (row: ApiPromptRow) => ({
  title: row.title,
  description: row.description,
  content: row.content,
  version: row.version,
  token_count: row.token_count,
  performance: row.performance,
  is_favorite: row.is_favorite,
  model: row.model,
  temperature: row.temperature,
  max_tokens: row.max_tokens,
  created_at: row.created_at,
  updated_at: row.updated_at,
  system_prompt: row.system_prompt,
  user_prompt: row.user_prompt,
  system_tokens: row.system_tokens,
  user_tokens: row.user_tokens,
});

export const handleRequest = async (request: Request, env: Env) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(request.url);
  const promptId = parsePromptId(url);
  if (!promptId) {
    return jsonResponse({ error: "invalid_prompt_id" }, 400);
  }

  const token = extractBearerToken(request.headers.get("Authorization"));
  if (!token) {
    return jsonResponse({ error: "authorization_required" }, 401);
  }

  let response: Response;
  try {
    response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/get_prompt_by_api_token`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_token: token,
        p_prompt_id: promptId,
        p_version: url.searchParams.get("version"),
      }),
    });
  } catch {
    console.error(JSON.stringify({ message: "prompt_rpc_request_failed" }));
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  if (!response.ok) {
    console.error(JSON.stringify({ message: "prompt_rpc_failed", status: response.status }));
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  const rows = (await response.json()) as ApiPromptRow[];
  const row = rows[0];
  if (!row) {
    return jsonResponse({ error: "upstream_error" }, 502);
  }

  if (row.status_code !== 200) {
    return jsonResponse({ error: row.error_code }, row.status_code);
  }

  return jsonResponse(publicPrompt(row));
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
