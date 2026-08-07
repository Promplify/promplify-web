# Promplify API Worker

This Worker exposes the version-aware prompt retrieval API documented at `api.promplify.com`.

The Worker delegates token validation, prompt ownership checks, and API usage tracking to the `get_prompt_by_api_token` Supabase RPC. It never receives a service-role credential.

## Local validation

```bash
npm install
npm run types
npm run type-check
npm run dev
```

Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Worker secrets. Do not commit their values.
