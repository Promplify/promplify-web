import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { extractBearerToken, handleRequest } from "../cloudflare-worker/src/index.ts";

const migration = await readFile(new URL("../supabase/migrations/20260807073400_add_product_event_tracking.sql", import.meta.url), "utf8");

test("accepts a single bearer token without exposing it", () => {
  assert.equal(extractBearerToken("Bearer token-value"), "token-value");
  assert.equal(extractBearerToken("bearer token-value"), "token-value");
  assert.equal(extractBearerToken("Basic token-value"), null);
  assert.equal(extractBearerToken("Bearer "), null);
});

test("rejects API requests before calling Supabase when authorization is missing", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamCalled = false;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    throw new Error("unexpected upstream request");
  };

  try {
    const response = await handleRequest(new Request("https://api.promplify.com/prompts/e72bd69e-a116-497f-94c4-7de6606a77be"), {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "public-placeholder",
    });

    assert.equal(response.status, 401);
    assert.equal(upstreamCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns an owned prompt from the Supabase RPC", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body, {
      p_token: "token-value",
      p_prompt_id: "e72bd69e-a116-497f-94c4-7de6606a77be",
      p_version: "2.1.0",
    });

    return Response.json([
      {
        status_code: 200,
        error_code: null,
        title: "Example prompt",
        version: "2.1.0",
      },
    ]);
  };

  try {
    const response = await handleRequest(
      new Request("https://api.promplify.com/prompts/e72bd69e-a116-497f-94c4-7de6606a77be?version=2.1.0", {
        headers: { Authorization: "Bearer token-value" },
      }),
      { SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "public-placeholder" }
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { title: "Example prompt", version: "2.1.0" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("migration covers the activation and retention event contract", () => {
  for (const eventName of [
    "first_prompt_created",
    "template_saved",
    "second_session_started",
    "prompt_shared",
    "plaza_prompt_published",
    "api_first_used",
    "api_used",
  ]) {
    assert.match(migration, new RegExp(`'${eventName}'`));
  }
});

test("API RPC updates token usage and enforces prompt ownership", () => {
  assert.match(migration, /SET last_used_at = now\(\)/);
  assert.match(migration, /request_id uuid := gen_random_uuid\(\)/);
  assert.doesNotMatch(migration, /p_request_id/);
  assert.match(migration, /current_prompt\.user_id = token_record\.user_id/);
  assert.match(migration, /parent_prompt\.user_id = token_record\.user_id/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.get_prompt_by_api_token/);
});

test("clients cannot write product events directly", () => {
  assert.match(migration, /REVOKE ALL ON TABLE public\.product_events FROM PUBLIC, anon, authenticated/);
  assert.doesNotMatch(migration, /GRANT INSERT ON TABLE public\.product_events TO authenticated/);
  assert.doesNotMatch(migration, /CREATE POLICY "Users can insert own product events"/);
});

test("controlled event writers are isolated from caller permissions", () => {
  for (const functionName of [
    "track_first_prompt_created",
    "track_prompt_share_created",
    "track_plaza_prompt_published",
    "record_product_session",
    "record_template_saved",
  ]) {
    const functionPattern = new RegExp(`FUNCTION public\\.${functionName}\\([^]*?SECURITY DEFINER[^]*?SET search_path = ''`);
    assert.match(migration, functionPattern);
  }
});
