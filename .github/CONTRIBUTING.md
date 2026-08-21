# Contributing to Promplify

Thank you for helping improve Promplify. Keep changes focused, testable, and easy to review.

## Before you start

- Search existing issues and pull requests before opening a duplicate.
- Open an issue before implementing architectural changes.
- Never include credentials, production data, or filled environment files.

## Development setup

Install Node.js 22.16+, npm 10+, the Supabase CLI, and Docker. Then follow either setup path in the main [`README.md`](../README.md): local Supabase or a new hosted Supabase project that you own.

Install exactly the dependency versions in the lockfile:

```bash
npm ci
```

## Branches

Create a branch from the latest `main` using `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, or `chore/<topic>`. Keep unrelated refactors out of feature and bug-fix pull requests.

## Quality requirements

Before opening or updating a pull request, run:

```bash
npm run check
npm run build
```

For database changes, also run:

```bash
npx supabase db reset
```

Add or update automated tests for behavioral changes. Include screenshots for visible UI changes and describe any manual smoke test.

## Database migrations

- Create migrations with `npx supabase migration new <name>`.
- Never edit a migration that has already been applied to a shared environment.
- Test the complete migration chain from an empty local database.
- Preserve Row Level Security and use least-privilege grants.
- Never expose a service-role or secret key to browser code.
- Document new environment variables and operational steps.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) in the form `type(scope): concise imperative subject`.

Common types are `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, and `chore`.

```text
feat(editor): add prompt diff preview
fix(auth): handle expired reset token
docs(setup): explain local Supabase
ci(checks): validate pull requests
```

Keep the subject to 50 characters when practical. Use the body to explain why, migration risk, or compatibility details.

## Pull requests

A pull request should explain the problem and solution, link related issues, list validation results, include UI evidence where applicable, and call out migrations or deployment steps. Keep it as a draft until required checks pass.

## Security and conduct

Do not report vulnerabilities in public issues. Follow [`SECURITY.md`](SECURITY.md) for private disclosure. All participation is governed by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
