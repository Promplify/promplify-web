// Run only against the disposable local GoTrue/PostgREST environment.
// Credentials and tokens are generated for synthetic local accounts and never logged.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";

const auth = "http://127.0.0.1:59999";
const rest = "http://127.0.0.1:53000";
const suffix = randomBytes(6).toString("hex");
const password = randomBytes(20).toString("hex");
async function request(base, path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}
async function signup(label) {
  const email = `privacy-${label}-${suffix}@example.invalid`;
  const created = await request(auth, "/signup", { method: "POST", body: { email, password } });
  assert.equal(created.status, 200, "local synthetic signup failed");
  const signedIn = await request(auth, "/token?grant_type=password", { method: "POST", body: { email, password } });
  assert.equal(signedIn.status, 200, "real GoTrue password login failed");
  assert.ok(signedIn.data.access_token);
  return { id: signedIn.data.user.id, token: signedIn.data.access_token };
}
const a = await signup("a");
const b = await signup("b");
const c = await signup("c");
console.log("PASS: real local GoTrue signup and password login for three synthetic accounts");
for (const [actor, label] of [
  [a, "A"],
  [b, "B"],
]) {
  const own = await request(rest, "/profiles?select=*", { token: actor.token });
  assert.equal(own.status, 200);
  assert.equal(own.data.length, 1);
  assert.equal(own.data[0].id, actor.id);
  const updated = await request(rest, `/profiles?id=eq.${actor.id}`, {
    method: "PATCH",
    token: actor.token,
    body: {
      full_name: `Synthetic ${label}`,
      username: `synthetic-${label}-${suffix}`,
      bio: `Private ${label} bio`,
      company: `Private ${label} company`,
      location: `Private ${label} location`,
      website: "https://example.invalid/private",
    },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.length, 1);
  assert.equal(updated.data[0].bio, `Private ${label} bio`);
}
assert.ok([401, 403].includes((await request(rest, "/profiles?select=*")).status));
assert.ok([401, 403].includes((await request(rest, `/profiles?id=eq.${a.id}&select=*`)).status));
for (const [actor, other] of [
  [a, b],
  [b, a],
]) {
  const read = await request(rest, `/profiles?id=eq.${other.id}&select=*`, { token: actor.token });
  assert.equal(read.status, 200);
  assert.deepEqual(read.data, []);
  const write = await request(rest, `/profiles?id=eq.${other.id}`, { method: "PATCH", token: actor.token, body: { bio: "cross-user overwrite" } });
  assert.equal(write.status, 200);
  assert.deepEqual(write.data, []);
}
console.log("PASS: real JWT/PostgREST owner read+edit; anonymous and cross-user full-profile access denied");
async function createPrompt(actor, title) {
  const result = await request(rest, "/prompts", { method: "POST", token: actor.token, body: { user_id: actor.id, title } });
  assert.equal(result.status, 201);
  return result.data[0].id;
}
const ap = await createPrompt(a, "Synthetic API public prompt");
const bp = await createPrompt(b, "Synthetic API private prompt");
const apiToken = `synthetic-api-${suffix}`;
const tokenCreated = await request(rest, "/api_tokens", {
  method: "POST",
  token: a.token,
  body: { user_id: a.id, name: "Synthetic local token", token: apiToken },
});
assert.equal(tokenCreated.status, 201);
for (const [value, prompt, expected] of [
  ["invalid", ap, 401],
  [apiToken, bp, 404],
  [apiToken, ap, 200],
]) {
  const result = await request(rest, "/rpc/get_prompt_by_api_token", {
    method: "POST",
    body: { p_token: value, p_prompt_id: prompt, p_version: null },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data[0].status_code, expected);
  if (expected !== 200) assert.equal(result.data[0].content, null);
}
const sessionId = randomUUID();
assert.ok(
  [401, 403].includes(
    (
      await request(rest, "/rpc/record_product_session", {
        method: "POST",
        body: { p_session_id: sessionId },
      })
    ).status
  )
);
for (let attempt = 0; attempt < 2; attempt++) {
  const result = await request(rest, "/rpc/record_product_session", {
    method: "POST",
    token: a.token,
    body: { p_session_id: sessionId },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data, false);
}
const deniedTemplate = await request(rest, "/rpc/record_template_saved", {
  method: "POST",
  token: a.token,
  body: { p_prompt_id: bp, p_template_id: 900001, p_source: "templates" },
});
assert.equal(deniedTemplate.status, 404);
for (const actor of [null, a, b]) {
  assert.ok([401, 403].includes((await request(rest, "/product_events?select=*", { token: actor?.token })).status));
  assert.ok(
    [401, 403].includes(
      (
        await request(rest, "/product_events", {
          method: "POST",
          token: actor?.token,
          body: { user_id: a.id, event_name: "session_started", event_key: `direct-${suffix}`, source: "web" },
        })
      ).status
    )
  );
}
console.log("PASS: real API token ownership, invalid token denial, session replay, cross-user events and direct event access denial");
const pub = await request(rest, "/plaza_prompts", { method: "POST", token: a.token, body: { user_id: a.id, prompt_id: ap } });
assert.equal(pub.status, 201);
const spoof = await request(rest, "/plaza_prompts", { method: "POST", token: c.token, body: { user_id: c.id, prompt_id: ap } });
assert.equal(spoof.status, 201);
const shareToken = `synthetic-${suffix}`;
assert.equal(
  (await request(rest, "/prompt_shares", { method: "POST", token: b.token, body: { prompt_id: bp, created_by: b.id, share_token: shareToken } })).status,
  201
);
for (const actor of [null, a, b]) {
  const result = await request(rest, "/public_authors?select=*", { token: actor?.token });
  assert.equal(result.status, 200);
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].id, a.id);
  assert.deepEqual(Object.keys(result.data[0]).sort(), ["avatar_url", "full_name", "id", "username"]);
  assert.equal(result.data[0].full_name, "Synthetic A");
  assert.equal((await request(rest, "/public_authors?select=bio", { token: actor?.token })).status, 400);
  assert.ok([401, 403].includes((await request(rest, "/public_authors", { method: "PATCH", token: actor?.token, body: { full_name: "tampered" } })).status));
}
const shared = await request(rest, "/rpc/get_shared_prompt_by_token", { method: "POST", body: { p_share_token: shareToken } });
assert.equal(shared.status, 200);
assert.equal(shared.data.length, 1);
assert.equal(shared.data[0].prompt_title, "Synthetic API private prompt");
assert.equal((await request(rest, "/public_authors?select=*")).data.length, 1);
assert.equal((await request(rest, `/plaza_prompts?id=eq.${pub.data[0].id}`, { method: "DELETE", token: a.token })).status, 200);
assert.deepEqual((await request(rest, "/public_authors?select=*")).data, []);
console.log("PASS: real API four-column authors, private/share-only/spoofed exclusion, write denial, private share RPC and unpublish lifecycle");
