import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

for (const target of ["app", "node"]) {
  test(`type-check rejects errors in the ${target} TypeScript project`, async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "promplify-type-gate-"));
    try {
      await mkdir(path.join(directory, "src"));
      await writeFile(path.join(directory, "package.json"), JSON.stringify({ scripts: { "type-check": packageJson.scripts["type-check"] } }));
      for (const config of ["tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"]) {
        await writeFile(path.join(directory, config), await readFile(path.join(root, config)));
      }
      const valid = 'export const value: string = "valid";';
      const invalid = "export const value: string = 123;";
      await writeFile(path.join(directory, "src/check.ts"), target === "app" ? invalid : valid);
      await writeFile(path.join(directory, "vite.config.ts"), target === "node" ? invalid : valid);
      const result = spawnSync("npm", ["run", "type-check"], {
        cwd: directory,
        encoding: "utf8",
        env: { ...process.env, PATH: `${path.join(root, "node_modules/.bin")}${path.delimiter}${process.env.PATH}` },
      });
      assert.equal(result.error, undefined);
      assert.notEqual(result.status, 0, "type-check must fail when the project contains a type error");
      assert.match(result.stdout, target === "app" ? /src\/check\.ts.*TS2322/ : /vite\.config\.ts.*TS2322/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
