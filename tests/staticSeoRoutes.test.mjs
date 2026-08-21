import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const generator = await readFile(new URL("../scripts/generate-static-route-html.mjs", import.meta.url), "utf8");
const redirects = await readFile(new URL("../public/_redirects", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
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
  assert.match(redirects, /^\/auth \/index\.html 200$/m);
  assert.match(redirects, /^\/auth\/\* \/index\.html 200$/m);
});
