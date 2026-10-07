import assert from "node:assert/strict";
import { test } from "node:test";
import { clearChunkRecovery, installChunkLoadRecovery, isChunkLoadError, recoverChunkLoad } from "../src/lib/chunkLoadRecovery.ts";

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("recognizes Vite dynamic import failures", () => {
  assert.equal(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://promplify.com/assets/Templates.js")), true);
  assert.equal(isChunkLoadError(new Error("API request failed")), false);
});

test("reloads once for the same route within the recovery window", () => {
  const storage = createStorage();
  let reloads = 0;
  const error = new TypeError("Failed to fetch dynamically imported module: /assets/Templates.js");

  assert.equal(
    recoverChunkLoad(error, "https://promplify.com/templates/", storage, () => reloads++, 1_000),
    true
  );
  assert.equal(
    recoverChunkLoad(error, "https://promplify.com/templates/", storage, () => reloads++, 2_000),
    false
  );
  assert.equal(reloads, 1);
});

test("allows manual recovery after the marker is cleared", () => {
  const storage = createStorage();
  const error = new TypeError("Error loading dynamically imported module");
  let reloads = 0;

  recoverChunkLoad(error, "https://promplify.com/templates/", storage, () => reloads++, 1_000);
  clearChunkRecovery(storage);
  recoverChunkLoad(error, "https://promplify.com/templates/", storage, () => reloads++, 2_000);

  assert.equal(reloads, 2);
});

test("preserves the import rejection before and after automatic recovery", () => {
  const previousWindow = globalThis.window;
  const target = new EventTarget();
  const storage = createStorage();
  let reloads = 0;
  globalThis.window = {
    addEventListener: target.addEventListener.bind(target),
    sessionStorage: storage,
    location: { href: "https://promplify.com/templates/", reload: () => reloads++ },
  };
  try {
    installChunkLoadRecovery();
    const error = new TypeError("Failed to fetch dynamically imported module: /assets/Templates.js");
    // Vite rejects the import unless the preload error event is canceled.
    const handleImportFailure = () => {
      const event = new Event("vite:preloadError", { cancelable: true });
      event.payload = error;
      target.dispatchEvent(event);
      if (!event.defaultPrevented) throw error;
    };
    assert.throws(handleImportFailure, (caught) => caught === error);
    assert.throws(handleImportFailure, (caught) => caught === error);
    assert.equal(reloads, 1);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("blocked storage does not replace the original chunk error", () => {
  const storage = {
    getItem() {
      throw new Error("Storage blocked");
    },
    setItem() {
      throw new Error("Storage blocked");
    },
    removeItem() {
      throw new Error("Storage blocked");
    },
  };
  let reloads = 0;
  const error = new TypeError("Failed to fetch dynamically imported module");
  assert.equal(
    recoverChunkLoad(error, "/templates/", storage, () => reloads++),
    false
  );
  assert.doesNotThrow(() => clearChunkRecovery(storage));
  assert.equal(reloads, 0);
});
