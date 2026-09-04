import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const generator = await readFile(new URL("../scripts/generate-static-route-html.mjs", import.meta.url), "utf8");
const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const privacyPage = await readFile(new URL("../src/pages/Privacy.tsx", import.meta.url), "utf8");
const termsPage = await readFile(new URL("../src/pages/Terms.tsx", import.meta.url), "utf8");

test("generates canonical static pages for public legal routes", () => {
  for (const route of ["privacy", "terms"]) {
    assert.match(generator, new RegExp(`outputPath: "${route}"[\\s\\S]*?urlPath: "/${route}/"`));
    assert.match(redirects, new RegExp(`^/${route} /${route}/ 301$`, "m"));
    assert.match(sitemap, new RegExp(`<loc>https://promplify\\.com/${route}/</loc>`));
  }

  assert.match(privacyPage, /canonicalPath="\/privacy\/"/);
  assert.match(termsPage, /canonicalPath="\/terms\/"/);
});

test("serves settings without an internal redirect target", () => {
  assert.match(generator, /outputPath: "settings"[\s\S]*?urlPath: "\/settings\/"[\s\S]*?robots: "noindex, follow"/);
  assert.match(redirects, /^\/settings \/settings\/ 301$/m);
});

test("serves direct auth and callback routes through the app shell", () => {
  assert.match(generator, /outputPath: "auth"[\s\S]*?urlPath: "\/auth\/"[\s\S]*?robots: "noindex, nofollow"/);
  assert.match(generator, /outputPath: "auth\/callback"[\s\S]*?urlPath: "\/auth\/callback\/"[\s\S]*?robots: "noindex, nofollow"/);
});

test("replaces multiline metadata instead of appending duplicate tags", () => {
  assert.match(generator, /const metaTagPattern/);
  assert.match(generator, /metaTagPattern\("name", "description"\)/);
  assert.ok(generator.includes("new RegExp(`<meta\\\\s+${attribute}="));
});

test("uses accurate website structured data without unverifiable reviews", () => {
  assert.match(indexHtml, /"@type": "WebSite"/);
  assert.match(indexHtml, /"@type": "Organization"/);
  assert.doesNotMatch(indexHtml, /"@type": "SoftwareApplication"/);
  assert.doesNotMatch(indexHtml, /aggregateRating|"review"/);
});

test("provides a static home page heading without JavaScript", () => {
  assert.match(indexHtml, /<noscript>[\s\S]*?<h1>Promplify AI Prompt Management and Optimization<\/h1>/);
});

test("generates a route-specific static heading for every public shell", () => {
  assert.match(generator, /heading: "Reusable AI prompt templates"/);
  assert.match(generator, /heading: "Discover shared AI prompts"/);
  assert.match(generator, /heading: "Promplify API documentation"/);
  assert.ok(generator.includes("/<noscript>[\\s\\S]*?<\\/noscript>/"));
  assert.ok(generator.includes("<h1>${escapeAttribute(route.heading)}</h1>"));
});
