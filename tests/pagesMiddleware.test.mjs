import assert from "node:assert/strict";
import { test } from "node:test";
import { isAppShellPath, onRequest } from "../functions/_middleware.ts";

test("classifies only known client application routes", () => {
  for (const pathname of ["/dashboard", "/template/209", "/share/example", "/discover/prompt/42"]) {
    assert.equal(isAppShellPath(pathname), true, pathname);
  }
  for (const pathname of ["/", "/auth", "/auth/callback", "/templates/", "/unknown", "/api-docs/"]) {
    assert.equal(isAppShellPath(pathname), false, pathname);
  }
});

test("serves the app shell for dynamic application URLs", async () => {
  let assetUrl = "";
  let nextCalled = false;
  const response = await onRequest({
    request: new Request("https://promplify.com/template/209?use=1"),
    env: {
      ASSETS: {
        async fetch(request) {
          assetUrl = request.url;
          return new Response("app shell", { status: 200 });
        },
      },
    },
    async next() {
      nextCalled = true;
      return new Response("next");
    },
  });

  assert.equal(response.status, 200);
  assert.equal(assetUrl, "https://promplify.com/");
  assert.equal(nextCalled, false);
});

test("passes unknown paths to the static asset server", async () => {
  let nextCalled = false;
  await onRequest({
    request: new Request("https://promplify.com/unknown"),
    env: { ASSETS: { fetch: async () => new Response("unexpected") } },
    async next() {
      nextCalled = true;
      return new Response("not found", { status: 404 });
    },
  });

  assert.equal(nextCalled, true);
});
