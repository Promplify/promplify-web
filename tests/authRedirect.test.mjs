import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAuthCallbackUrl, buildAuthPath, getSafeAuthRedirect } from "../src/lib/authRedirect.ts";

test("keeps same-origin auth continuation paths", () => {
  assert.equal(getSafeAuthRedirect("/template/42?use=1"), "/template/42?use=1");
  assert.equal(buildAuthPath("/template/42?use=1"), "/auth?mode=register&next=%2Ftemplate%2F42%3Fuse%3D1");
});

test("rejects external and protocol-relative auth redirects", () => {
  assert.equal(getSafeAuthRedirect("https://example.com"), "/dashboard");
  assert.equal(getSafeAuthRedirect("//example.com/path"), "/dashboard");
  assert.equal(getSafeAuthRedirect("/\\example.com"), "/dashboard");
});

test("builds an allowlist-compatible callback URL with the continuation path", () => {
  assert.equal(
    buildAuthCallbackUrl("https://promplify.com", "/template/42?use=1"),
    "https://promplify.com/auth/callback?next=%2Ftemplate%2F42%3Fuse%3D1",
  );
});
