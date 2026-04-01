-- Ensure plaza likes trigger can update likes_count under RLS.
-- Trigger function must run with definer privileges because plaza_prompts has no public UPDATE policy.

CREATE OR REPLACE FUNCTION public.update_plaza_prompt_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
