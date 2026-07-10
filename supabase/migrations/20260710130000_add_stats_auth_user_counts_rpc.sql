-- Provide aggregate-only auth user counts for external growth reporting.
-- This avoids exposing auth.users rows through a public view or Data API table.

CREATE OR REPLACE FUNCTION public.get_promplify_auth_user_counts(p_since timestamptz DEFAULT NULL)
RETURNS TABLE(
  total_users integer,
  users_since integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, pg_temp
AS $function$
  SELECT
    count(*)::integer AS total_users,
    count(*) FILTER (WHERE p_since IS NOT NULL AND created_at >= p_since)::integer AS users_since
  FROM auth.users;
$function$;

REVOKE ALL ON FUNCTION public.get_promplify_auth_user_counts(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_promplify_auth_user_counts(timestamptz) TO service_role;

COMMENT ON FUNCTION public.get_promplify_auth_user_counts(timestamptz)
IS 'Aggregate-only auth user counts for Promplify growth reporting.';
