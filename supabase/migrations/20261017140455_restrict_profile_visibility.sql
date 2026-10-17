BEGIN;

-- Remove every legacy SELECT/ALL path: permissive policies are ORed together.
-- Fail closed on schema drift rather than silently preserving public access.
DO $migration$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policyname FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND cmd IN ('SELECT', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', policy_record.policyname);
  END LOOP;
END;
$migration$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

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
