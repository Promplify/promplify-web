import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldDropReactRemoveChildNoise } from "../src/lib/sentryNoise.ts";

const removeChildEvent = {
  exception: {
    values: [
      {
        type: "NotFoundError",
        value: "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
        stacktrace: {
          frames: [
            {
              filename: "../../node_modules/react-dom/cjs/react-dom.production.min.js",
              module: "react-dom/cjs/react-dom.production",
              function: "Uc",
              in_app: false
            }
          ]
        }
      }
    ]
  }
};

test("drops React DOM removeChild noise without application frames", () => {
  assert.equal(shouldDropReactRemoveChildNoise(removeChildEvent), true);
});

test("keeps removeChild errors when application frames are present", () => {
  const event = structuredClone(removeChildEvent);
  event.exception.values[0].stacktrace.frames.push({
    filename: "src/components/dashboard/PromptEditor.tsx",
    module: "src.components.dashboard.PromptEditor",
    function: "PromptEditor",
    in_app: true
  });

  assert.equal(shouldDropReactRemoveChildNoise(event), false);
});

test("keeps unrelated DOM exceptions", () => {
  const event = structuredClone(removeChildEvent);
  event.exception.values[0].value = "ResizeObserver loop completed with undelivered notifications.";

  assert.equal(shouldDropReactRemoveChildNoise(event), false);
});
