-- Resolve current Supabase Security Advisor findings without widening API access.

-- 1) Remove the public view that exposed auth.users rows through the Data API.
DROP VIEW IF EXISTS public.promplify_stats_auth_users;

-- 2) Keep GraphQL disabled. The app uses PostgREST/RPC, not pg_graphql,
-- and schema introspection should not expose table structure.
DROP EXTENSION IF EXISTS pg_graphql;
CREATE SCHEMA IF NOT EXISTS graphql_public;
REVOKE ALL ON SCHEMA graphql_public FROM PUBLIC, anon, authenticated;

COMMENT ON SCHEMA public IS '@graphql({"introspection": false})';

-- 3) Prevent future dashboard-created objects from receiving broad API grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 4) Add narrow RLS paths used by SECURITY INVOKER RPCs below.
DROP POLICY IF EXISTS "RPC can read prompt share by token" ON public.prompt_shares;
CREATE POLICY "RPC can read prompt share by token"
ON public.prompt_shares
FOR SELECT
TO anon, authenticated
USING (
  share_token = nullif(current_setting('promplify.share_token', true), '')
);

DROP POLICY IF EXISTS "RPC can update prompt share views by token" ON public.prompt_shares;
CREATE POLICY "RPC can update prompt share views by token"
ON public.prompt_shares
FOR UPDATE
TO anon, authenticated
USING (
  share_token = nullif(current_setting('promplify.share_token', true), '')
)
WITH CHECK (
  share_token = nullif(current_setting('promplify.share_token', true), '')
);

DROP POLICY IF EXISTS "RPC can increment prompt template views" ON public.prompt_template;
CREATE POLICY "RPC can increment prompt template views"
ON public.prompt_template
FOR UPDATE
TO anon, authenticated
USING (
  id = nullif(current_setting('promplify.template_view_id', true), '')::bigint
)
WITH CHECK (
  id = nullif(current_setting('promplify.template_view_id', true), '')::bigint
);

DROP POLICY IF EXISTS "Public can view own or plaza prompts" ON public.prompts;
DROP POLICY IF EXISTS "Public can view own, plaza, or shared prompts" ON public.prompts;
CREATE POLICY "Public can view own, plaza, or shared prompts"
ON public.prompts
FOR SELECT
TO public
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.plaza_prompts pp
    WHERE pp.prompt_id = prompts.id
  )
  OR EXISTS (
    SELECT 1
    FROM public.prompt_shares ps
    WHERE ps.prompt_id = prompts.id
      AND ps.share_token = nullif(current_setting('promplify.share_token', true), '')
  )
);

-- 5) Convert public business RPCs away from SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.get_shared_prompt_by_token(p_share_token text)
RETURNS TABLE(
  id uuid,
  prompt_id uuid,
  share_token text,
  views integer,
  created_at timestamp with time zone,
  created_by uuid,
  prompt_title text,
  prompt_description text,
  prompt_system_prompt text,
  prompt_user_prompt text,
  prompt_version character varying,
  prompt_token_count integer,
  prompt_category_id uuid
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
BEGIN
  PERFORM set_config('promplify.share_token', coalesce(p_share_token, ''), true);

  RETURN QUERY
  WITH updated_share AS (
    UPDATE public.prompt_shares ps
    SET views = coalesce(ps.views, 0) + 1
    WHERE ps.share_token = p_share_token
    RETURNING ps.id, ps.prompt_id, ps.share_token, ps.views, ps.created_at, ps.created_by
  )
  SELECT
    us.id,
    us.prompt_id,
    us.share_token,
    us.views,
    us.created_at,
    us.created_by,
    p.title,
    p.description,
    p.system_prompt,
    p.user_prompt,
    p.version::character varying,
    p.token_count,
    p.category_id
  FROM updated_share us
  JOIN public.prompts p ON p.id = us.prompt_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_shared_prompt_by_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_prompt_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_template_views(p_template_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
DECLARE
  updated_views integer;
BEGIN
  PERFORM set_config('promplify.template_view_id', p_template_id::text, true);

  UPDATE public.prompt_template pt
  SET views = coalesce(pt.views, 0) + 1
  WHERE pt.id = p_template_id
  RETURNING pt.views INTO updated_views;

  RETURN updated_views;
END;
$function$;

REVOKE ALL ON FUNCTION public.increment_template_views(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_template_views(bigint) TO anon, authenticated;

-- 6) Trigger helpers and unused token validation must not be callable as RPC.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_plaza_prompt_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_api_token(text) FROM PUBLIC, anon, authenticated;
