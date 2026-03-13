# Repository Guidelines

## Project Structure & Module Organization
This repository has three main parts:
- `src/`: React + TypeScript frontend.
  - `pages/` for route-level screens.
  - `components/` for reusable UI blocks (`ui/` holds shadcn-style primitives).
  - `services/` for API-facing logic.
  - `lib/` and `utils/` for shared helpers.
  - `types/` for TypeScript domain models.
- `supabase/`: database and backend assets (`migrations/`, `functions/`).
- `cloudflare-worker/`: optional Cloudflare Worker API service.

Static assets are in `public/`. Root config lives in files like `vite.config.ts`, `tailwind.config.ts`, and `eslint.config.js`.

## Build, Test, and Development Commands
- `npm install`: install root dependencies (Node `>=20.18.3`).
- `npm run dev`: start Vite dev server.
- `npm run build`: production build to `dist/`.
- `npm run build:dev`: development-mode build.
- `npm run lint` / `npm run lint:fix`: run/fix ESLint.
- `npm run type-check`: run TypeScript checks without output.
- `npm run clean`: remove build cache artifacts.

Worker commands:
- `cd cloudflare-worker && npm run dev`: run Worker locally.
- `cd cloudflare-worker && npm run deploy`: deploy Worker.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`), React function components.
- Indentation: 2 spaces; keep functions focused and reusable.
- Naming:
  - Components/files: `PascalCase` (for example, `PromptEditor.tsx`).
  - Hooks: `useXxx` (for example, `use-mobile.tsx` exports hook APIs).
  - Variables/functions: `camelCase`.
- Use ESLint as the source of truth for style and quality rules.

## Testing Guidelines
Automated tests are not fully established yet (`npm test` is currently a placeholder). For every change:
- Run `npm run type-check` and `npm run lint`.
- Perform manual smoke checks for impacted pages/routes.
- If adding tests, prefer `*.test.ts` / `*.test.tsx` near the related module.

## Commit & Pull Request Guidelines
- Use concise Conventional Commit style: `type(scope): subject`.
- Preferred types: `feat`, `fix`, `refactor`, `docs`, `chore`.
- Keep subject imperative and under 50 characters.
- PRs should include:
  - What changed and why.
  - Linked issue(s).
  - UI screenshots/GIFs for visual changes.
  - Notes for schema/env updates (for example, new Supabase migrations).

## Security & Configuration Tips
- Never commit secrets from `.env`; keep `.env.example` updated.
- Use platform secret managers for production values:
  - Supabase secrets (`supabase secrets set ...`)
  - Cloudflare Worker secrets (`wrangler secret put ...`)
