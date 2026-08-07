# Product Analytics

Promplify keeps GA4 for acquisition and interaction analysis, while Supabase stores durable product milestones that must be reconcilable with business rows.

## Event definitions

| Event | Definition | Source |
| --- | --- | --- |
| `first_prompt_created` | The user's earliest saved prompt | Database trigger, with historical backfill |
| `template_saved` | A template successfully copied into the user's prompt library | Authenticated RPC after the prompt insert succeeds |
| `session_started` | An authenticated product session using a 30-minute inactivity window | Authenticated web RPC |
| `second_session_started` | The first session whose ID differs from the user's initial recorded session | Authenticated web RPC |
| `prompt_shared` | A private share link is first created | Database trigger, with historical backfill |
| `plaza_prompt_published` | A prompt is published to Discover | Database trigger, with historical backfill |
| `api_first_used` | The first successful API request observed for a token after durable tracking is released | API retrieval RPC |
| `api_used` | Every idempotently identified successful API request | API retrieval RPC |

## Data boundaries

- Events contain user and entity UUIDs for aggregation, but no email, prompt body, share token, API token, cookie, or raw URL.
- Clients cannot insert or read the event table through the Data API; controlled triggers and authenticated RPCs write validated events.
- The public API RPC accepts a bearer token, checks expiration and prompt ownership, returns only the documented prompt fields, and never returns token data.
- Event writes are idempotent through unique event keys.

## Release order

1. Apply `20260807073400_add_product_event_tracking.sql`.
2. Verify Supabase security and performance advisors.
3. Deploy the API Worker and verify an owned prompt request updates `last_used_at` and creates API events.
4. Deploy the frontend and verify a new authenticated session plus template save.
5. Compare Supabase milestone totals with GA4 events; differences are expected because GA4 can be blocked, while business milestones come from database truth.
