import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("loads analytics only for Promplify production hosts", () => {
  assert.match(indexHtml, /new Set\(\["promplify\.com", "www\.promplify\.com"\]\)/);
  assert.match(indexHtml, /analyticsHosts\.has\(window\.location\.hostname\)/);
  assert.doesNotMatch(indexHtml, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/);
});
