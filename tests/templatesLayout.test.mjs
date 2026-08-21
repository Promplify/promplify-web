import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const templatesPage = await readFile(new URL("../src/pages/Templates.tsx", import.meta.url), "utf8");

test("keeps the templates page focused on template browsing", () => {
  assert.match(templatesPage, /const templateQuickFilters = \["ChatGPT", "Claude", "Marketing", "Writing", "Coding", "Workflow"\]/);

  for (const removedSection of [
    "templateUseCases",
    "workflowLinks",
    "longTailSearches",
    "faqItems",
    "Popular prompt template searches",
    "Find the right prompt template faster",
    "Prompt Template FAQ",
  ]) {
    assert.doesNotMatch(templatesPage, new RegExp(removedSection));
  }
});
