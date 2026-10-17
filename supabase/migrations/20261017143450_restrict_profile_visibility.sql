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

COMMIT;
