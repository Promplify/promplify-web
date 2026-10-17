# Profile privacy repair candidate

Base: `3df40a2d608f1cfa1ff2164b755be4c30d5329ff`.

## Security boundary

The legacy `PUBLIC USING (true)` SELECT policy and anonymous table grants allow every profile column to be read. The claimed download of 1,609 rows is unverified; this work does not establish an actual disclosure or its size.

Full `profiles` rows become owner-only (`profiles.id = auth.uid()`). Existing owner INSERT/UPDATE policies and signup triggers stay unchanged. Remove every SELECT/ALL profile policy, including historical alternate names, because permissive policies combine with OR. Revoke all table grants from PUBLIC, anon and authenticated, then grant only SELECT/INSERT/UPDATE to authenticated. This also removes legacy TRUNCATE rights that RLS cannot restrict.

Discover reads `public_authors`, a read-only view returning exactly `id`, `username`, `full_name`, `avatar_url`. A user qualifies only while a `plaza_prompts` publication references a prompt owned by that same publisher. Private-only accounts, token-share-only accounts and forged publisher/owner pairings do not qualify. Public authors remain enumerable because their public content needs attribution; no all-account profile directory remains.

The view intentionally uses owner privileges (`security_invoker=false`) to cross the private-table boundary, with `security_barrier=true`. Created by the migration's postgres role, its owner is postgres (asserted in tests). Its fixed, schema-qualified projection and predicate are the declassification boundary; never add private columns or replace the projection with `SELECT *`. A view has no mutable function search_path; its relation references are bound at creation. No SECURITY DEFINER RPC is added. Existing profile creation is trigger-only; sharing/template RPCs do not read profiles.

## Confirmed production target and metadata

Read-only Supabase connector metadata on 2026-10-17 confirmed:

- Project: `promplify`, ref `jnwfnaexsmxqtbotkcon`, region `us-west-1`, status ACTIVE_HEALTHY.
- Database: PostgreSQL `17.6.1.084` (major 17).
- Profiles policies: public SELECT USING true; authenticated owner INSERT; authenticated owner UPDATE with both USING and WITH CHECK.
- Both anon and authenticated have legacy ALL table grants; no explicit profile column grants were found.
- No dependent profile views/materialized views were found. The only non-system function text matching `profiles` was `public.handle_new_user`, SECURITY DEFINER, search_path `public, pg_temp`, with client EXECUTE denied.
- Neither anon nor authenticated has CREATE on the public schema.

These were catalog/configuration queries only; no profile or auth-user rows were queried. Function text searches are a focused check, not proof against arbitrary dynamic SQL or external services. Metadata should be rechecked immediately before an approved change.

Frontend target declared in tracked configuration: Cloudflare Pages project `promplify-web-portal`, output `dist`, public domain `promplify.com`, repository `Promplify/promplify-web`. The Cloudflare account and current production deployment mapping were not independently queried; confirm them before approving/executing deployment. The separate API Worker is unchanged.

## Local verification

These are execution tests, not SQL-string assertions:

1. `node scripts/test-profile-privacy.mjs`: disposable official `postgres:17-alpine`, private network disabled, no host ports. Minimal synthetic Auth stand-in, real PostgreSQL roles anon/authenticated/service_role and auth.uid(), all prior app migrations, baseline anonymous private-column reproduction, simulated legacy ALL grants plus alternate public policy, then the candidate migration and SQL assertions. Containers are removed in finally.
2. `node scripts/test-profile-e2e.mjs`: disposable PostgreSQL 17, official GoTrue `v2.186.0`, official PostgREST `v13.0.7`, real GoTrue-created auth tables and real signed JWTs. Database is on an internal Docker network. Only Auth/API are published on localhost ports 59999/53000; they also use a publishing network. The auth.uid() helper matches the production catalog definition. All app migrations execute, then `test-profile-http.mjs` exercises real signup/password login, own profile reads/edits, anonymous and cross-user direct table denial, view access/columns/write denial for anonymous/A/B, private/share-only/spoofed exclusion, private-share RPC and unpublish lifecycle. Only newly generated test credentials/tokens are used, and they are never logged. Containers/network are removed in finally. Pull the three official images first if absent; runners deliberately do not pull automatically.
3. Chrome against the built frontend and localhost proxy to real GoTrue/PostgREST: synthetic account login, own full-profile load, private bio save, success toast, reload and persisted value all passed. Screenshot is retained outside source. This browser run used PostgreSQL 16; both reproducible database suites additionally passed on PostgreSQL 17. A separate Discover mock-API smoke test displayed synthetic content and author and queried public_authors rather than profiles.
4. `npm run check`: root type-check, lint, 37 existing tests and formatting passed. Production build passed with localhost Supabase URL, synthetic key and Sentry upload token unset. Build emitted an existing large-chunk warning.
5. Extra `tsc -p tsconfig.app.json --noEmit`: 13 existing errors, byte-identical on baseline and candidate. These include login resend metadata, old plaza imports/UI variants, Discover tag typing and share typing. The successful login/profile-edit paths and Discover attribution were exercised, but other pre-existing erroneous branches are not certified. Root type-check is references-only and insufficient to establish clean app types. This prevents declaring all verification gates clean.

The standard full Supabase CLI reset/lint/advisor workflow remains unverified: local CLI 2.75 rejects tracked `local_smtp`/`auth.jwt` config keys, and a generated compatible local config then encountered a public image-registry rate limit. No production credentials or config were used to work around it. The real component integration above closes the login/API authorization gap, but does not certify the entire Supabase stack (Storage, Realtime, Kong or OAuth providers).

## Approved-action boundary and rollout order

No production SQL, grants/RLS/auth change, push, merge or deployment has been executed. Obtain explicit approval for:

1. The exact migration `20261017140455_restrict_profile_visibility.sql` on Supabase project `jnwfnaexsmxqtbotkcon`, executed as postgres. It removes profile SELECT/ALL policies, revokes client table grants, grants authenticated SELECT/INSERT/UPDATE, creates owner SELECT RLS and the four-column public view with anonymous/authenticated SELECT only. It changes no profile rows, auth settings or existing RPC bodies.
2. Publishing the reviewed frontend revision to the confirmed Cloudflare Pages `promplify-web-portal` production project serving `promplify.com`, after verifying account/project/domain identity. If Git integration deploys on main, pushing/merging that revision is part of the approval, not an implied local-commit action.

Recommended two-stage sequence: **database transaction first, frontend second**. The view and restrictions take effect together at COMMIT. During the interval old clients still query profiles and can show the existing Anonymous User fallback for other authors; public content and owner profile access continue. If frontend fails, keep the database privacy restriction. Deploying frontend first would leave exposure open until SQL succeeds and could prematurely display a privacy promise, so avoid it. Refresh PostgREST schema cache if the new view is not discovered.

Before execution, recheck policies/ACLs/column grants/dependencies/view ownership, postgres role, migration history, exposed schemas and the two dedicated owner write policies; an unknown custom ALL policy may carry legitimate writes and requires adaptation. Preserve metadata snapshots without user rows. After approved rollout, verify deployment identity and metadata; use only explicitly approved synthetic production accounts for business checks, never enumerate real profiles.

## Rollback without reopening exposure

SQL failure before COMMIT rolls back the transaction. After COMMIT, roll back only frontend assets if necessary and keep owner-only profile access. Old clients may display fallback attribution; that is preferable to reopening private fields.

If the view itself must be removed after reverting frontend, this separate approved recovery removes only the public projection:

```sql
BEGIN;
REVOKE ALL ON TABLE public.public_authors FROM PUBLIC, anon, authenticated;
DROP VIEW public.public_authors;
COMMIT;
```

Never automatically restore PUBLIC USING true or anonymous profiles SELECT. Restoring that baseline reopens the reported access issue and requires a separate explicit risk decision. There is no data migration to reverse.
