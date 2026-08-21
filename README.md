# Promplify

<div align="center">
  <a href="https://promplify.com">
    <img src="public/logo.svg" alt="Promplify" width="180" />
  </a>

  <p>Open-source prompt management for creating, versioning, sharing, and integrating reusable AI workflows.</p>

[![CI](https://github.com/Promplify/promplify-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Promplify/promplify-web/actions/workflows/ci.yml)
[![Secret Scan](https://github.com/Promplify/promplify-web/actions/workflows/secret-scan.yml/badge.svg)](https://github.com/Promplify/promplify-web/actions/workflows/secret-scan.yml)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22.16-339933?logo=nodedotjs&logoColor=white)](.node-version)

[Live app](https://promplify.com) · [Documentation](https://promplify.com/api-docs/) · [Report a bug](https://github.com/Promplify/promplify-web/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/Promplify/promplify-web/issues/new?template=feature_request.yml)
</div>

## Why Promplify

Promplify gives individuals and teams a durable home for prompts instead of scattering them across chats and documents. It combines structured prompt editing with version history, reusable templates, private share links, a public discovery feed, and API access.

## Features

- Separate system and user instructions with token counting
- Organize prompts with categories, tags, favorites, and version history
- Start from reusable templates and save them to a private library
- Share prompts by private link or publish them to Discover
- Create API tokens and retrieve prompts from applications
- Run against your own Supabase project or a fully local Supabase stack

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, and shadcn/ui
- Supabase Postgres, Auth, Row Level Security, and Edge Functions
- Cloudflare Pages and Workers for the hosted deployment

## Prerequisites

- Node.js 22.16 or newer; the pinned version is in [`.node-version`](.node-version)
- npm 10 or newer
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
- Docker Desktop or another Docker-compatible runtime for fully local development

## Quick start with local Supabase

This is the fastest way to run a disposable development environment.

```bash
git clone https://github.com/Promplify/promplify-web.git
cd promplify-web
npm ci
npx supabase start
cp .env.example .env.local
```

Copy the local API URL and publishable key shown by `npx supabase status` into `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

Then start the app:

```bash
npm run dev
```

Open:

- App: <http://localhost:8080>
- Supabase Studio: <http://127.0.0.1:54323>
- Local email inbox: <http://127.0.0.1:54324>

The local database is created from the tracked migrations and seeded with a few development templates. To rebuild it from scratch, run `npx supabase db reset`.

## Use your own hosted Supabase project

Use a new, empty Supabase project for this workflow. Existing projects may have migration-history conflicts.

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Link the repository and preview the migration plan.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push --include-seed
```

3. In Supabase Auth URL Configuration, add:

```text
http://localhost:8080/auth/callback
http://localhost:8080/reset-password
```

4. Copy the project URL and publishable key from the project's Connect dialog into `.env.local`.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-project-key
```

5. Run `npm run dev`, register a user, and use the confirmation link from your configured email provider.

Google and GitHub sign-in are optional. If you enable them, configure each provider in Supabase and add the same callback URL to its OAuth application.

For Edge Function setup, migration rules, and troubleshooting, see [`supabase/README.md`](supabase/README.md).

## Optional prompt optimization

The `optimize-system-prompt` Edge Function uses DeepSeek. The rest of Promplify works without it.

```bash
npx supabase secrets set DEEPSEEK_API_KEY=your-key
npx supabase functions deploy optimize-system-prompt
```

For local function development, keep function-only secrets in an ignored file and pass it to `npx supabase functions serve --env-file <path>`.

## Deployment notes

- Use `npm ci && npm run build`; the tracked lockfile is the dependency source of truth.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the build environment.
- Set `VITE_SENTRY_DSN` only when a fork should report browser errors to its own Sentry project. Local development does not report to Promplify.
- Sentry source maps are generated and uploaded only when the server-side build environment explicitly provides `SENTRY_AUTH_TOKEN`. Uploaded map files are removed from `dist` before deployment.
- Never expose Supabase secret keys, service-role keys, or Sentry auth tokens through `VITE_` variables.

## Development commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Start Vite on port 8080                            |
| `npm run check`         | Run types, lint, tests, and formatting checks      |
| `npm run test`          | Run the Node test suite                            |
| `npm run type-check`    | Check TypeScript without emitting files            |
| `npm run lint`          | Run ESLint                                         |
| `npm run format`        | Format supported source and documentation files    |
| `npm run build`         | Create the production bundle and static route HTML |
| `npm run preview`       | Preview the production bundle                      |
| `npx supabase db reset` | Recreate and seed the local database               |

## Project structure

```text
src/                  React application
tests/                Automated tests
supabase/
  functions/          Edge Functions
  migrations/         Ordered database migrations
  seed.sql            Local development data
cloudflare-worker/    Public API Worker
scripts/              Build and verification helpers
public/               Static public assets
```

## Contributing

Read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) before opening a pull request. The short version:

1. Create a focused branch from `main`.
2. Add tests for behavioral changes.
3. Run `npm run check && npm run build`.
4. Use Conventional Commits, for example `fix(auth): handle expired callback`.
5. Explain migrations, environment changes, and UI evidence in the pull request.

Community participation follows the [`CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md). Report vulnerabilities privately according to [`SECURITY.md`](.github/SECURITY.md).

## License

Promplify is licensed under the [MIT License](LICENSE).
