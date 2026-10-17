import assert from "node:assert/strict";
import { test } from "node:test";
import { getRelatedTag } from "../src/lib/promptTags.ts";

const tag = { id: "tag-1", name: "Writing" };

test("preserves tag labels from a to-one PostgREST join", () => {
  assert.deepEqual(getRelatedTag(tag), tag);
});

test("normalizes array-shaped tag joins without passing nested arrays to the UI", () => {
  assert.deepEqual(getRelatedTag([tag]), tag);
});

test("treats empty or inaccessible tag relationships as absent", () => {
  assert.equal(getRelatedTag([]), null);
  assert.equal(getRelatedTag(null), null);
  assert.equal(getRelatedTag(undefined), null);
});
