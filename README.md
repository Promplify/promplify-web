# Promplify

<div align="center">

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/Promplify/promplify-web/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/issues)
[![Forks](https://img.shields.io/github/forks/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/network/members)
[![Stars](https://img.shields.io/github/stars/Promplify/promplify-web)](https://github.com/Promplify/promplify-web/stargazers)

Open-source AI prompt management platform for creating, versioning, and sharing prompts.

[Live Demo](https://promplify.com) | [Report Bug](https://github.com/Promplify/promplify-web/issues) | [Request Feature](https://github.com/Promplify/promplify-web/issues)

</div>

## Overview

Promplify helps teams and individual builders manage prompts in a structured way. It provides a prompt editor, versioning workflow, sharing links, discover feed, and API access for application integration.

## Core Features

- Prompt editor with system/user prompt separation and token counting
- Prompt versioning and history tracking
- Share links for collaborative review
- Community discover feed for reusable prompts
- API token management for integration use cases
- Supabase-backed authentication and data storage

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- Backend/API: Supabase Edge Functions, Cloudflare Worker (optional)
- Database/Auth: Supabase

## Requirements

- Node.js `>=20.18.3`
- npm
- Supabase account
- Cloudflare account (only if you deploy the optional worker)

## Quick Start

1. Clone and install dependencies.

```bash
git clone https://github.com/Promplify/promplify-web.git
cd promplify-web
npm install
```

2. Create local environment file.

```bash
cp .env.example .env
```

3. Fill `.env` with your own values.

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start development server.

```bash
npm run dev
```

5. Open `http://localhost:8080`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run type-check` | Run TypeScript type check |
| `npm run preview` | Preview production build |
| `npm run clean` | Remove build caches |

## Supabase Setup

For database migrations and edge functions:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
supabase functions deploy
```

Set required function secrets:

```bash
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_api_key
```

See [supabase/README.md](supabase/README.md) for details.

## Cloudflare Worker (Optional)

If you need the worker-based API layer:

```bash
cd cloudflare-worker
npm run dev
# or
npm run deploy
```

Set worker secrets before deploy:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
```

See [cloudflare-worker/README.md](cloudflare-worker/README.md).

## Contributing Code

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for branch, PR, and quality requirements.
- Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) in all community interactions.
- Run `npm run type-check` and `npm run lint` before opening a pull request.

## Security and Secrets

- Never commit secrets, tokens, private keys, or filled `.env` files.
- Keep `.env` local only; `.env.example` is the only environment file that should be tracked.
- Security disclosures should follow [SECURITY.md](SECURITY.md).
- This repository runs automated secret scanning in CI (`.github/workflows/secret-scan.yml`).

To reproduce secret scanning locally:

```bash
# Scan git history and tracked content
docker run --rm -v "$(pwd):/repo" -w /repo zricethezav/gitleaks:latest git --config .gitleaks.toml --redact

# Optional: scan current working tree (includes untracked files)
docker run --rm -v "$(pwd):/repo" -w /repo zricethezav/gitleaks:latest dir . --config .gitleaks.toml --redact
```

## License

Licensed under Apache License 2.0. See [LICENSE](LICENSE).
