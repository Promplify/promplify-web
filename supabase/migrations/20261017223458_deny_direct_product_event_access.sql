BEGIN;

-- Product events are written only by vetted functions and triggers.
-- A restrictive policy also denies access if a future migration adds grants.
CREATE POLICY "Deny direct browser access to product events"
ON public.product_events AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE public.product_events FROM PUBLIC, anon, authenticated;

-- Preserve the RPC signature while returning explicit HTTP/input errors.
CREATE OR REPLACE FUNCTION public.record_template_saved(
  p_prompt_id uuid,
  p_template_id bigint,
  p_source text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  inserted_count integer := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_source IS NULL OR p_source NOT IN ('templates', 'template_detail') THEN
    RAISE EXCEPTION 'Invalid template source' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.prompts owned_prompt
    WHERE owned_prompt.id = p_prompt_id
      AND owned_prompt.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Prompt not found' USING ERRCODE = 'PT404';
  END IF;

  INSERT INTO public.product_events (
    user_id,
    event_name,
    event_key,
    source,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    current_user_id,
    'template_saved',
    'template_saved:' || p_prompt_id::text,
    p_source,
    'prompt',
    p_prompt_id,
    jsonb_build_object('template_id', p_template_id)
  )
  ON CONFLICT (event_key) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count = 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_template_saved(uuid, bigint, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_template_saved(uuid, bigint, text) TO authenticated;

COMMIT;
