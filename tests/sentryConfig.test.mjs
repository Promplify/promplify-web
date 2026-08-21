import assert from "node:assert/strict";
import test from "node:test";
import { resolveSentryDsn } from "../src/lib/sentryConfig.ts";

test("does not send local or fork telemetry to Promplify", () => {
  assert.equal(resolveSentryDsn("localhost"), undefined);
  assert.equal(resolveSentryDsn("fork.example"), undefined);
});

test("uses an explicitly configured DSN for a fork", () => {
  const configuredDsn = "https://public@example.invalid/1";
  assert.equal(resolveSentryDsn("fork.example", configuredDsn), configuredDsn);
});

test("keeps monitoring enabled on the official production host", () => {
  assert.ok(resolveSentryDsn("promplify.com"));
});
