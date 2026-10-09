import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { twMerge } from "tailwind-merge";

test("build dependency locks exclude vulnerable transitive versions", async () => {
  const root = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));
  const worker = JSON.parse(await readFile(new URL("../cloudflare-worker/package-lock.json", import.meta.url), "utf8"));
  assert.ok(!Object.keys(root.packages).some((path) => path.endsWith("/braces")));
  const parsers = Object.entries(root.packages).filter(([path]) => path.endsWith("/postcss-selector-parser"));
  assert.ok(parsers.length > 0);
  for (const [, pkg] of parsers) {
    assert.ok(pkg.version.localeCompare("7.1.6", undefined, { numeric: true }) >= 0);
  }
  const sharp = Object.entries(worker.packages).filter(([path]) => path.endsWith("/sharp"));
  assert.ok(sharp.length > 0);
  for (const [, pkg] of sharp) {
    assert.ok(pkg.version.localeCompare("0.35.5", undefined, { numeric: true }) >= 0);
  }
});

test("Tailwind preserves typography, animation and dynamic theme utilities", async () => {
  const file = new URL("../src/index.css", import.meta.url);
  const source = await readFile(file, "utf8");
  const result = await postcss([tailwindcss()]).process(`${source}\n@source inline("prose animate-in bg-background text-foreground dark:bg-background");`, {
    from: file.pathname,
  });
  assert.match(result.css, /\.prose\s*\{/);
  assert.match(result.css, /\.animate-in\s*\{/);
  assert.match(result.css, /background-color:\s*hsl\(var\(--background\)\)/);
  assert.match(result.css, /color:\s*hsl\(var\(--foreground\)\)/);
  assert.match(result.css, /:is\(\.dark \*\)/);
});

test("Tailwind 4 class merging keeps the latest shadow and gradient", () => {
  assert.equal(twMerge("shadow-xs shadow-sm"), "shadow-sm");
  assert.equal(twMerge("bg-linear-to-r bg-linear-to-l"), "bg-linear-to-l");
});
