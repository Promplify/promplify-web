-- Add a durable, privacy-safe product event stream for activation and retention.

CREATE TABLE public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (
    event_name IN (
      'first_prompt_created',
      'template_saved',
      'session_started',
      'second_session_started',
      'prompt_shared',
      'plaza_prompt_published',
      'api_first_used',
      'api_used'
    )
  ),
  event_key text NOT NULL UNIQUE CHECK (char_length(event_key) BETWEEN 1 AND 160),
  source text NOT NULL CHECK (
    source IN (
      'dashboard',
      'templates',
      'template_detail',
      'private_link',
      'discover',
      'web',
      'api',
      'backfill'
    )
  ),
  entity_type text CHECK (
    entity_type IS NULL OR entity_type IN ('prompt', 'prompt_share', 'plaza_prompt', 'api_token', 'session')
  ),
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (octet_length(metadata::text) <= 2048),
  occurred_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX product_events_user_occurred_at_idx
ON public.product_events (user_id, occurred_at DESC);

CREATE INDEX product_events_name_occurred_at_idx
ON public.product_events (event_name, occurred_at DESC);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.product_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_first_prompt_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.prompts existing_prompt
    WHERE existing_prompt.user_id = NEW.user_id
      AND existing_prompt.id <> NEW.id
  ) THEN
    INSERT INTO public.product_events (
      user_id,
      event_name,
      event_key,
      source,
      entity_type,
      entity_id,
      occurred_at
    )
    VALUES (
      NEW.user_id,
      'first_prompt_created',
      'first_prompt:' || NEW.user_id::text,
      'dashboard',
      'prompt',
      NEW.id,
      coalesce(NEW.created_at, now())
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER track_first_prompt_created_after_insert
AFTER INSERT ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.track_first_prompt_created();

CREATE OR REPLACE FUNCTION public.track_prompt_share_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.product_events (
      user_id,
      event_name,
      event_key,
      source,
      entity_type,
      entity_id,
      metadata,
      occurred_at
    )
    VALUES (
      NEW.created_by,
      'prompt_shared',
      'prompt_share:' || NEW.id::text,
      'private_link',
      'prompt_share',
      NEW.id,
      jsonb_build_object('prompt_id', NEW.prompt_id),
      coalesce(NEW.created_at, now())
    )
    ON CONFLICT (event_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER track_prompt_share_created_after_insert
AFTER INSERT ON public.prompt_shares
FOR EACH ROW
EXECUTE FUNCTION public.track_prompt_share_created();

CREATE OR REPLACE FUNCTION public.track_plaza_prompt_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.product_events (
    user_id,
    event_name,
    event_key,
    source,
    entity_type,
    entity_id,
    metadata,
    occurred_at
  )
  VALUES (
    NEW.user_id,
    'plaza_prompt_published',
    'plaza_prompt:' || NEW.id::text,
    'discover',
    'plaza_prompt',
    NEW.id,
    jsonb_build_object('prompt_id', NEW.prompt_id),
    coalesce(NEW.created_at, now())
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER track_plaza_prompt_published_after_insert
AFTER INSERT ON public.plaza_prompts
FOR EACH ROW
EXECUTE FUNCTION public.track_plaza_prompt_published();

REVOKE ALL ON FUNCTION public.track_first_prompt_created() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_prompt_share_created() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_plaza_prompt_published() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_product_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  is_second_session boolean := false;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL THEN
    RAISE EXCEPTION 'Session ID is required' USING ERRCODE = '22004';
  END IF;

  INSERT INTO public.product_events (
    user_id,
    event_name,
    event_key,
    source,
    entity_type,
    entity_id
  )
  VALUES (
    current_user_id,
    'session_started',
    'session:' || p_session_id::text,
    'web',
    'session',
    p_session_id
  )
  ON CONFLICT (event_key) DO NOTHING;

  IF EXISTS (
    SELECT 1
    FROM public.product_events previous_session
    WHERE previous_session.user_id = current_user_id
      AND previous_session.event_name = 'session_started'
      AND previous_session.entity_id <> p_session_id
  ) THEN
    INSERT INTO public.product_events (
      user_id,
      event_name,
      event_key,
      source,
      entity_type,
      entity_id
    )
    VALUES (
      current_user_id,
      'second_session_started',
      'second_session:' || current_user_id::text,
      'web',
      'session',
      p_session_id
    )
    ON CONFLICT (event_key) DO NOTHING;

    is_second_session := true;
  END IF;

  RETURN is_second_session;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_product_session(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_product_session(uuid) TO authenticated;

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

  IF p_source NOT IN ('templates', 'template_detail') THEN
    RAISE EXCEPTION 'Invalid template source' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.prompts owned_prompt
    WHERE owned_prompt.id = p_prompt_id
      AND owned_prompt.user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Prompt not found' USING ERRCODE = 'P0002';
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

CREATE OR REPLACE FUNCTION public.get_prompt_by_api_token(
  p_token text,
  p_prompt_id uuid,
  p_version text
)
RETURNS TABLE (
  status_code integer,
  error_code text,
  title text,
  description text,
  content text,
  version text,
  token_count integer,
  performance integer,
  is_favorite boolean,
  model text,
  temperature numeric,
  max_tokens integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  system_prompt text,
  user_prompt text,
  system_tokens integer,
  user_tokens integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  token_record record;
  prompt_exists boolean := false;
  request_id uuid := gen_random_uuid();
BEGIN
  SELECT api_token.id, api_token.user_id
  INTO token_record
  FROM public.api_tokens api_token
  WHERE api_token.token = p_token
    AND (api_token.expires_at IS NULL OR api_token.expires_at > now())
  FOR UPDATE;

  IF token_record.id IS NULL THEN
    RETURN QUERY SELECT
      401, 'invalid_token'::text,
      NULL::text, NULL::text, NULL::text, NULL::text,
      NULL::integer, NULL::integer, NULL::boolean, NULL::text, NULL::numeric,
      NULL::integer, NULL::timestamp with time zone, NULL::timestamp with time zone,
      NULL::text, NULL::text, NULL::integer, NULL::integer;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.prompts current_prompt
    WHERE current_prompt.id = p_prompt_id
      AND current_prompt.user_id = token_record.user_id
      AND (p_version IS NULL OR current_prompt.version = p_version)
    UNION ALL
    SELECT 1
    FROM public.prompt_versions historical_version
    JOIN public.prompts parent_prompt ON parent_prompt.id = historical_version.prompt_id
    WHERE historical_version.prompt_id = p_prompt_id
      AND parent_prompt.user_id = token_record.user_id
      AND p_version IS NOT NULL
      AND historical_version.version = p_version
  ) INTO prompt_exists;

  IF NOT prompt_exists THEN
    RETURN QUERY SELECT
      404, 'prompt_not_found'::text,
      NULL::text, NULL::text, NULL::text, NULL::text,
      NULL::integer, NULL::integer, NULL::boolean, NULL::text, NULL::numeric,
      NULL::integer, NULL::timestamp with time zone, NULL::timestamp with time zone,
      NULL::text, NULL::text, NULL::integer, NULL::integer;
    RETURN;
  END IF;

  UPDATE public.api_tokens
  SET last_used_at = now()
  WHERE id = token_record.id;

  INSERT INTO public.product_events (
    user_id, event_name, event_key, source, entity_type, entity_id, metadata
  )
  VALUES (
    token_record.user_id,
    'api_first_used',
    'api_first:' || token_record.id::text,
    'api',
    'api_token',
    token_record.id,
    jsonb_build_object('prompt_id', p_prompt_id)
  )
  ON CONFLICT (event_key) DO NOTHING;

  INSERT INTO public.product_events (
    user_id, event_name, event_key, source, entity_type, entity_id, metadata
  )
  VALUES (
    token_record.user_id,
    'api_used',
    'api_request:' || request_id::text,
    'api',
    'api_token',
    token_record.id,
    jsonb_build_object('prompt_id', p_prompt_id, 'requested_version', p_version)
  )
  ON CONFLICT (event_key) DO NOTHING;

  RETURN QUERY
  WITH candidates AS (
    SELECT
      current_prompt.title,
      current_prompt.description,
      current_prompt.content,
      current_prompt.version,
      current_prompt.token_count,
      current_prompt.performance,
      current_prompt.is_favorite,
      current_prompt.model,
      current_prompt.temperature,
      current_prompt.max_tokens,
      current_prompt.created_at,
      current_prompt.updated_at,
      current_prompt.system_prompt,
      current_prompt.user_prompt,
      current_prompt.system_tokens,
      current_prompt.user_tokens,
      1 AS priority
    FROM public.prompts current_prompt
    WHERE current_prompt.id = p_prompt_id
      AND current_prompt.user_id = token_record.user_id
      AND (p_version IS NULL OR current_prompt.version = p_version)

    UNION ALL

    SELECT
      parent_prompt.title,
      parent_prompt.description,
      historical_version.content,
      historical_version.version::text,
      historical_version.token_count,
      parent_prompt.performance,
      parent_prompt.is_favorite,
      coalesce(historical_version.model, parent_prompt.model),
      coalesce(historical_version.temperature::numeric, parent_prompt.temperature),
      coalesce(historical_version.max_tokens, parent_prompt.max_tokens),
      parent_prompt.created_at,
      historical_version.created_at,
      historical_version.system_prompt,
      historical_version.user_prompt,
      NULL::integer,
      NULL::integer,
      2 AS priority
    FROM public.prompt_versions historical_version
    JOIN public.prompts parent_prompt ON parent_prompt.id = historical_version.prompt_id
    WHERE historical_version.prompt_id = p_prompt_id
      AND parent_prompt.user_id = token_record.user_id
      AND p_version IS NOT NULL
      AND historical_version.version = p_version
  )
  SELECT
    200,
    NULL::text,
    candidate.title,
    candidate.description,
    candidate.content,
    candidate.version,
    candidate.token_count,
    candidate.performance,
    candidate.is_favorite,
    candidate.model,
    candidate.temperature,
    candidate.max_tokens,
    candidate.created_at,
    candidate.updated_at,
    candidate.system_prompt,
    candidate.user_prompt,
    candidate.system_tokens,
    candidate.user_tokens
  FROM candidates candidate
  ORDER BY candidate.priority
  LIMIT 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_prompt_by_api_token(text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_prompt_by_api_token(text, uuid, text) TO anon, authenticated;

-- Backfill milestones that can be reconstructed from durable business rows.
INSERT INTO public.product_events (
  user_id, event_name, event_key, source, entity_type, entity_id, occurred_at
)
SELECT DISTINCT ON (prompt.user_id)
  prompt.user_id,
  'first_prompt_created',
  'first_prompt:' || prompt.user_id::text,
  'backfill',
  'prompt',
  prompt.id,
  coalesce(prompt.created_at, now())
FROM public.prompts prompt
WHERE prompt.user_id IS NOT NULL
ORDER BY prompt.user_id, prompt.created_at, prompt.id
ON CONFLICT (event_key) DO NOTHING;

INSERT INTO public.product_events (
  user_id, event_name, event_key, source, entity_type, entity_id, metadata, occurred_at
)
SELECT
  prompt_share.created_by,
  'prompt_shared',
  'prompt_share:' || prompt_share.id::text,
  'backfill',
  'prompt_share',
  prompt_share.id,
  jsonb_build_object('prompt_id', prompt_share.prompt_id),
  prompt_share.created_at
FROM public.prompt_shares prompt_share
WHERE prompt_share.created_by IS NOT NULL
ON CONFLICT (event_key) DO NOTHING;

INSERT INTO public.product_events (
  user_id, event_name, event_key, source, entity_type, entity_id, metadata, occurred_at
)
SELECT
  plaza_prompt.user_id,
  'plaza_prompt_published',
  'plaza_prompt:' || plaza_prompt.id::text,
  'backfill',
  'plaza_prompt',
  plaza_prompt.id,
  jsonb_build_object('prompt_id', plaza_prompt.prompt_id),
  plaza_prompt.created_at
FROM public.plaza_prompts plaza_prompt
ON CONFLICT (event_key) DO NOTHING;
