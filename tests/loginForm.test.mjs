import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = await readFile(new URL("../src/components/auth/LoginForm.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});

const createForm = (loginResult) => {
  const submittedEmail = "reader@example.com";
  const states = [submittedEmail, "correct-password", false, {}];
  let stateIndex = 0;
  const notifications = [];
  const resendRequests = [];
  const navigation = [];
  const modules = {
    react: { useState: () => [states[stateIndex++], () => {}] },
    "@/components/ui/button": { Button: "button" },
    "@/components/ui/input": { Input: "input" },
    "@/components/ui/label": { Label: "label" },
    "@/lib/analytics": { trackAuthStarted: () => {}, trackLogin: () => {} },
    "@/lib/supabase": {
      supabase: {
        auth: {
          signInWithPassword: async () => loginResult,
          resend: async (request) => {
            resendRequests.push(request);
            return { error: null };
          },
        },
      },
    },
    "react-router-dom": { Link: "a", useNavigate: () => (destination) => navigation.push(destination) },
    sonner: { toast: { error: (...args) => notifications.push(args), success: () => {} } },
  };
  const exports = {};
  vm.runInNewContext(outputText, { exports, console, require: (name) => modules[name] ?? require(name) });
  const form = exports.LoginForm({ redirectPath: "/template/42?use=1" });
  return { form, submittedEmail, notifications, resendRequests, navigation };
};

test("resends signup confirmation to the submitted email when Supabase returns no user", async () => {
  const context = createForm({ data: { user: null, session: null }, error: { message: "Email not confirmed" } });
  await context.form.props.onSubmit({ preventDefault() {} });
  assert.equal(context.notifications.length, 1);
  await context.notifications[0][1].action.onClick();
  assert.equal(context.resendRequests.length, 1);
  assert.equal(context.resendRequests[0].type, "signup");
  assert.equal(context.resendRequests[0].email, context.submittedEmail);
  assert.equal(context.navigation.length, 0);
});

test("successful login preserves the requested continuation path", async () => {
  const context = createForm({ data: { user: { id: "user-1" } }, error: null });
  await context.form.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(context.navigation, ["/template/42?use=1"]);
  assert.equal(context.resendRequests.length, 0);
});
