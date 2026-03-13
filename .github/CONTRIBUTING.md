# Contributing to Promplify

Thank you for contributing to Promplify. This guide describes the required workflow for code contributions.

## Prerequisites

- Node.js `>=20.18.3`
- npm
- Supabase CLI (for database/function related changes)

## Development Setup

```bash
git clone https://github.com/your-username/promplify-web.git
cd promplify-web
npm install
cp .env.example .env
```

Fill `.env` with your own local values before running the app.

Run local development server:

```bash
npm run dev
```

## Contribution Workflow

1. Fork the repository and sync from `main`.
2. Create a branch from `main`.
3. Implement your change with focused scope.
4. Run required checks.
5. Open a pull request with clear context and testing notes.

Suggested branch naming:

- `feature/<short-topic>`
- `bugfix/<short-topic>`
- `chore/<short-topic>`

## Required Checks Before PR

Run these commands locally before opening or updating a PR:

```bash
npm run type-check
npm run lint
```

Optional but recommended for release-impacting changes:

```bash
npm run build
```

## Commit Message Convention

Use this format:

```text
type(scope): subject
```

Rules:

- Use lowercase `type` and `scope`
- Keep one-line subject concise and imperative
- Keep subject within 50 characters when possible

Recommended types:

- `feature`
- `bugfix`
- `hotfix`
- `chore`
- `docs`
- `refactor`
- `test`

Examples:

- `feature(editor): add prompt diff preview`
- `bugfix(auth): handle expired reset token`
- `chore(ci): add secret scan workflow`

## Pull Request Checklist

- Explain what changed and why
- Link related issues
- Include screenshots for UI changes
- Mention any required env, migration, or deployment updates
- Confirm required checks passed locally

## Security Requirements

- Do not commit `.env`, private keys, API tokens, or secrets
- Store local secrets only in untracked files
- Use placeholders in docs and examples
- If a secret is exposed, rotate it immediately and remove it from history

This repository includes CI secret scanning via `.github/workflows/secret-scan.yml`.

Run a local scan before pushing:

```bash
# Git history and tracked files
docker run --rm -v "$(pwd):/repo" -w /repo zricethezav/gitleaks:latest git --config .gitleaks.toml --redact

# Optional working tree scan (includes untracked files)
docker run --rm -v "$(pwd):/repo" -w /repo zricethezav/gitleaks:latest dir . --config .gitleaks.toml --redact
```

## Reporting Security Issues

Do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md) to report responsibly.

## Code of Conduct

By participating in this project, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
