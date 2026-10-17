# Reviewed security contracts

Reviewed on October 18, 2026 (Asia/Shanghai). These are explicit business boundaries, not a blanket exemption for Security Advisor findings. New privileged entry points require review and regression coverage.

## Private profiles and public attribution

`profiles` is owner-only. The `public_authors` view intentionally runs with its postgres owner's privileges and a security barrier to expose only `id`, `username`, `full_name`, and `avatar_url` for current Discover publishers who own the referenced prompt. Private-only users and token-share-only users are excluded. Changing the view to invoker access would remove public attribution; restoring public profile SELECT would reopen private fields.

The profile SQL and real HTTP suites test private-column denial, write denial, owner isolation, forged publication pairs, profile updates and unpublish lifecycle. The Advisor's `security_definer_view` notice is expected for this narrowly reviewed projection.

## Token API and event recording

The public Token API must work without a browser login. `get_prompt_by_api_token` intentionally permits anon/authenticated execution, but authorizes through a valid unexpired API token and its owner's current or historical prompt. Invalid, expired and revoked tokens return 401; other users' prompts and unknown versions return 404. Failed calls must not update usage or record API events.

`record_product_session` and `record_template_saved` intentionally use owner privileges to write controlled events. Only authenticated callers may execute them, identity comes from `auth.uid()`, and template recording requires prompt ownership. Template sources reject null and unknown values with `22023`; unavailable or other users' prompts return an explicit HTTP 404 (`PT404`) rather than a server error. Event input and duplicate handling are tested. These functions use a fixed empty search path and remain postgres-owned; their privileges and the exact client-callable definer function inventory are asserted in CI. The corresponding Advisor notices remain expected and visible.

Clients have no table privileges on `product_events`. A restrictive deny-all RLS policy also prevents direct access if a future migration accidentally grants table access and adds a permissive policy. Trigger/RPC writes continue to work. Do not grant direct client INSERT just to resolve a permission error.

## Hosted password protection

Production currently uses the Supabase Free plan. The dashboard and [official password security documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) confirm that native leaked-password protection requires Pro or above. The user explicitly chose to retain Free on October 18, 2026. No subscription, billing, password, login provider, session or authentication settings were changed.

The `auth_leaked_password_protection` warning therefore remains an accepted plan limitation, not a completed mitigation. A frontend-only password check would be bypassable and is not a replacement. Revisit native protection if the project upgrades. Historical exposure size cannot be established from the reported email or these regressions.

## CI enforcement

- `npm run type-check` checks both `tsconfig.app.json` and `tsconfig.node.json`; the root reference-only configuration is not used as proof of application type safety.
- Negative tests inject actual app and build-config type errors into disposable copies and require the type-check command to fail.
- `npm run check` includes type checks, lint, unit tests and formatting. CI also builds the frontend.
- Database CI resets and lints the full Supabase schema. Authorization regression CI runs real PostgreSQL role assertions plus real GoTrue/PostgREST HTTP tests.
- Privileged SQL contracts cover valid/invalid/expired/revoked tokens, owner/current/historical access, rejected cross-user requests, event side effects, replay, missing identity, direct event access and accidental future grants.

These checks do not certify arbitrary external services, every OAuth provider, historical access logs, or future migrations before they run through review and CI.
