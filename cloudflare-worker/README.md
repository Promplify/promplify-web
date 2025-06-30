# Promplify API Worker

This directory contains the Cloudflare Worker that acts as the API for Promplify.

## Development

To run the worker locally for development, you can use the following command:

```bash
npm run dev
```

## Deployment

Before deploying this worker, you need to set up the required secrets for it to connect to Supabase. These secrets are not stored in the repository for security reasons.

1.  **Set Supabase URL:**
    Run the following command. You will be prompted to enter your Supabase project URL.

    ```bash
    npx wrangler secret put SUPABASE_URL
    ```

2.  **Set Supabase Anon Key:**
    Run the following command. You will be prompted to enter your Supabase anon key.

    ```bash
    npx wrangler secret put SUPABASE_ANON_KEY
    ```

After setting the secrets, you can deploy the worker to your Cloudflare account:

```bash
npm run deploy
```
