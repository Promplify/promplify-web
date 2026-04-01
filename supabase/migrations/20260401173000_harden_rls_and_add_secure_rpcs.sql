-- Harden RLS policies, add secure RPCs, and clean up advisory index issues.

-- 1) Enable RLS on prompt_shares (critical security finding).
ALTER TABLE public.prompt_shares ENABLE ROW LEVEL SECURITY;

-- 2) Remove existing policies on impacted tables to avoid duplicates and always-true rules.
DO $$
DECLARE
  target_table text;
  policy_record record;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'api_tokens',
    'categories',
    'plaza_likes',
    'plaza_prompts',
    'profiles',
    'prompt_shares',
    'prompt_tags',
    'prompt_template',
    'prompt_versions',
    'prompts',
    'tags'
  ]
  LOOP
    FOR policy_record IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, target_table);
    END LOOP;
  END LOOP;
END;
$$;

-- 3) Recreate policies with strict scopes and initplan-friendly auth helpers.

-- api_tokens
CREATE POLICY "Users can view own api tokens"
ON public.api_tokens
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own api tokens"
ON public.api_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own api tokens"
ON public.api_tokens
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own api tokens"
ON public.api_tokens
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- categories
CREATE POLICY "Users can view own categories"
ON public.categories
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories"
ON public.categories
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- plaza_prompts
CREATE POLICY "Public can view plaza prompts"
ON public.plaza_prompts
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can insert own plaza prompts"
ON public.plaza_prompts
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own plaza prompts"
ON public.plaza_prompts
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- plaza_likes
CREATE POLICY "Public can view plaza likes"
ON public.plaza_likes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can insert own plaza likes"
ON public.plaza_likes
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own plaza likes"
ON public.plaza_likes
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- prompt_shares
CREATE POLICY "Users can view own prompt shares"
ON public.prompt_shares
FOR SELECT
TO authenticated
USING (created_by = (select auth.uid()));

CREATE POLICY "Users can insert own prompt shares"
ON public.prompt_shares
FOR INSERT
TO authenticated
WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Users can update own prompt shares"
ON public.prompt_shares
FOR UPDATE
TO authenticated
USING (created_by = (select auth.uid()))
WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Users can delete own prompt shares"
ON public.prompt_shares
FOR DELETE
TO authenticated
USING (created_by = (select auth.uid()));

-- prompts
CREATE POLICY "Public can view own or plaza prompts"
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
);

CREATE POLICY "Users can insert own prompts"
ON public.prompts
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own prompts"
ON public.prompts
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own prompts"
ON public.prompts
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- prompt_tags
CREATE POLICY "Public can view own or plaza prompt tags"
ON public.prompt_tags
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.plaza_prompts pp
    WHERE pp.prompt_id = prompt_tags.prompt_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.id = prompt_tags.prompt_id
      AND p.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can insert own prompt tags"
ON public.prompt_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.id = prompt_tags.prompt_id
      AND p.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can delete own prompt tags"
ON public.prompt_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.id = prompt_tags.prompt_id
      AND p.user_id = (select auth.uid())
  )
);

-- prompt_template
CREATE POLICY "Public can view prompt templates"
ON public.prompt_template
FOR SELECT
TO public
USING (true);

CREATE POLICY "Service role can insert prompt templates"
ON public.prompt_template
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update prompt templates"
ON public.prompt_template
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete prompt templates"
ON public.prompt_template
FOR DELETE
TO service_role
USING (true);

-- prompt_versions
CREATE POLICY "Users can view own prompt versions"
ON public.prompt_versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.id = prompt_versions.prompt_id
      AND p.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can insert own prompt versions"
ON public.prompt_versions
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = (select auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.id = prompt_versions.prompt_id
      AND p.user_id = (select auth.uid())
  )
);

-- tags
CREATE POLICY "Public can view own or plaza tags"
ON public.tags
FOR SELECT
TO public
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.prompt_tags pt
    JOIN public.plaza_prompts pp ON pp.prompt_id = pt.prompt_id
    WHERE pt.tag_id = tags.id
  )
);

CREATE POLICY "Users can insert own tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own tags"
ON public.tags
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- 4) Fix mutable search_path warnings on functions.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_prompt_versions(p_prompt_id uuid)
RETURNS TABLE(
  version character varying,
  content text,
  system_prompt text,
  user_prompt text,
  token_count integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    pv.version,
    pv.content,
    pv.system_prompt,
    pv.user_prompt,
    pv.token_count,
    pv.created_at
  FROM public.prompt_versions pv
  WHERE pv.prompt_id = p_prompt_id
  ORDER BY pv.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_plaza_prompt_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.plaza_prompts
    SET likes_count = likes_count + 1
    WHERE id = NEW.plaza_prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.plaza_prompts
    SET likes_count = likes_count - 1
    WHERE id = OLD.plaza_prompt_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- 5) Add secure RPCs for anonymous-safe reads and writes.

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
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
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
    p.version,
    p.token_count,
    p.category_id
  FROM updated_share us
  JOIN public.prompts p ON p.id = us.prompt_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_shared_prompt_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_prompt_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_template_views(p_template_id bigint)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  WITH updated AS (
    UPDATE public.prompt_template pt
    SET views = coalesce(pt.views, 0) + 1
    WHERE pt.id = p_template_id
    RETURNING pt.views
  )
  SELECT views FROM updated;
$function$;

REVOKE ALL ON FUNCTION public.increment_template_views(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_template_views(bigint) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.validate_api_token(p_token text)
RETURNS TABLE(user_id uuid, expires_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT at.user_id, at.expires_at
  FROM public.api_tokens at
  WHERE at.token = p_token
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.validate_api_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_api_token(text) TO anon, authenticated;

-- 6) Index cleanup and foreign key index coverage.

-- Add missing foreign-key helper indexes.
CREATE INDEX IF NOT EXISTS idx_prompt_shares_created_by ON public.prompt_shares (created_by);
CREATE INDEX IF NOT EXISTS prompt_shares_prompt_id_idx ON public.prompt_shares (prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_by ON public.prompt_versions (created_by);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON public.prompt_versions (prompt_id);
CREATE INDEX IF NOT EXISTS idx_plaza_likes_user_id ON public.plaza_likes (user_id);

-- Drop duplicate/unused indexes highlighted by advisor.
DROP INDEX IF EXISTS public.idx_prompt_template_title;
DROP INDEX IF EXISTS public.idx_prompt_template_category;
DROP INDEX IF EXISTS public.tags_name_idx;
DROP INDEX IF EXISTS public.prompt_shares_share_token_idx;
