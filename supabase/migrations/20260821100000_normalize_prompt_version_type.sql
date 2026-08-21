-- Keep prompt version values compatible with text-returning public RPCs.
ALTER TABLE public.prompts
ALTER COLUMN version TYPE text;

ALTER TABLE public.prompt_versions
ALTER COLUMN version TYPE text;

DROP FUNCTION public.get_prompt_versions(uuid);

CREATE FUNCTION public.get_prompt_versions(p_prompt_id uuid)
RETURNS TABLE(
  version text,
  content text,
  system_prompt text,
  user_prompt text,
  token_count integer,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  SELECT
    prompt_version.version,
    prompt_version.content,
    prompt_version.system_prompt,
    prompt_version.user_prompt,
    prompt_version.token_count,
    prompt_version.created_at
  FROM public.prompt_versions prompt_version
  WHERE prompt_version.prompt_id = p_prompt_id
    AND EXISTS (
      SELECT 1
      FROM public.prompts prompt
      WHERE prompt.id = prompt_version.prompt_id
        AND prompt.user_id = (select auth.uid())
    )
  ORDER BY prompt_version.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.get_prompt_versions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_prompt_versions(uuid) TO authenticated;
