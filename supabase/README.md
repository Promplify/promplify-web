# Supabase development

This directory is the reproducible backend definition for Promplify. It contains CLI configuration, ordered migrations, local seed data, and Edge Functions.

## Requirements

- Supabase CLI
- Docker for the local stack
- A new Supabase project if you want to test against a hosted backend

## Local workflow

Start the stack and apply every migration plus `seed.sql`:

```bash
npx supabase start
```

Recreate the database after migration changes:

```bash
npx supabase db reset
```

Useful local endpoints are printed by `npx supabase status`. By default, Studio is available at <http://127.0.0.1:54323> and the test email inbox at <http://127.0.0.1:54324>.

Stop the stack when it is no longer needed with `npx supabase stop`.

## Hosted project workflow

Use a new, empty project. Review the migration plan before applying it:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push --include-seed
```

The seed is optional and contains only development prompt templates. Omit `--include-seed` when you want an empty template library.

Installations created before the tracked baseline may have different migration history. Maintainers must compare `supabase migration list` with the target environment and reconcile history before applying newer migrations; never run the baseline against an existing production database without that review.

Set the frontend project URL and publishable key in `.env.local`. Never put a Supabase secret key or legacy service-role key in a `VITE_` variable.

## Authentication

The local config allows these development callbacks:

```text
http://localhost:8080/auth/callback
http://localhost:8080/reset-password
```

Add the same URLs in the hosted project's Auth URL Configuration. OAuth providers are optional and require their own provider credentials and callback configuration.

## Edge Function

Prompt optimization is optional and requires a DeepSeek API key:

```bash
npx supabase secrets set DEEPSEEK_API_KEY=your-key
npx supabase functions deploy optimize-system-prompt
```

For local development, store the function secret in an ignored file outside the frontend environment and run `npx supabase functions serve --env-file <path-to-local-function-env>`.

## Schema overview

- `prompts`, `prompt_versions`, `categories`, `tags`, and `prompt_tags`: private prompt library
- `prompt_template`: reusable starter templates
- `prompt_shares`: private share links
- `plaza_prompts` and `plaza_likes`: public discovery content
- `profiles`: public profile fields linked to Supabase Auth users
- `api_tokens`: API access managed by each user
- `product_events`: privacy-limited activation and retention milestones

All browser-facing tables use Row Level Security. Public reads and RPCs are intentionally narrow. Product events cannot be inserted directly by browser clients.

## Migration rules

1. Create files with `npx supabase migration new <name>` so every version is unique.
2. Do not modify a migration already applied to a shared environment.
3. Run `npx supabase db reset` to verify the entire chain from an empty database.
4. Add indexes for foreign keys and high-frequency filters.
5. Preserve least-privilege grants and explicitly test RLS behavior.
6. Update this document when setup or operational requirements change.

## Troubleshooting

- If Docker is unavailable, use a hosted project that you own.
- If `db push` reports migration history conflicts, do not use an existing production project; create an empty development project.
- If authentication redirects are rejected, verify the exact callback and reset URLs in Supabase Auth settings.
- If a query is blocked, inspect the active session and RLS policy instead of bypassing RLS with a secret key.
- If prompt optimization fails while other features work, verify only the Edge Function and its server-side DeepSeek secret.
