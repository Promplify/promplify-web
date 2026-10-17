BEGIN;

-- Intentional, read-only declassification boundary. Owner privileges allow this
-- projection to read profiles despite owner-only RLS; never add private columns.
-- A barrier prevents caller predicates from being pushed before eligibility.
CREATE VIEW public.public_authors
WITH (security_barrier = true, security_invoker = false) AS
SELECT profile.id, profile.username, profile.full_name, profile.avatar_url
FROM public.profiles AS profile
WHERE EXISTS (
  SELECT 1
  FROM public.plaza_prompts AS publication
  JOIN public.prompts AS prompt
    ON prompt.id = publication.prompt_id
    AND prompt.user_id = publication.user_id
  WHERE publication.user_id = profile.id
);

REVOKE ALL ON TABLE public.public_authors FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.public_authors TO anon, authenticated;
COMMENT ON VIEW public.public_authors IS
  'Only four public attribution fields for current Discover authors. Never expose private profile fields here.';

COMMIT;
