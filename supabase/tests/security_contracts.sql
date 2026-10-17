-- Execute only against an isolated database. Every fixture rolls back.
BEGIN;
INSERT INTO auth.users(id) VALUES
 ('a0000000-0000-0000-0000-000000000001'),
 ('a0000000-0000-0000-0000-000000000002');
INSERT INTO public.prompts(id,user_id,title,content,version) VALUES
 ('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Synthetic A','current A','2.0.0'),
 ('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002','Synthetic B','private B','1.0.0');
INSERT INTO public.prompt_versions(prompt_id,version,content,created_by) VALUES
 ('b0000000-0000-0000-0000-000000000001','1.0.0','historical A','a0000000-0000-0000-0000-000000000001'),
 ('b0000000-0000-0000-0000-000000000002','0.9.0','private historical B','a0000000-0000-0000-0000-000000000002');
INSERT INTO public.api_tokens(id,user_id,name,token,expires_at) VALUES
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Synthetic valid','synthetic-valid',NULL),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Synthetic expired','synthetic-expired',now()-interval '1 day');

-- Deliberate elevated entry points must not gain owners, schemas or callers.
DO $$ DECLARE function_name text; BEGIN
 FOR function_name IN SELECT unnest(ARRAY[
  'public.get_prompt_by_api_token(text,uuid,text)',
  'public.record_product_session(uuid)',
  'public.record_template_saved(uuid,bigint,text)'
 ]) LOOP
  ASSERT (SELECT prosecdef AND pg_get_userbyid(proowner)='postgres'
   AND proconfig @> ARRAY['search_path=""'] FROM pg_proc WHERE oid=function_name::regprocedure);
 END LOOP;
 ASSERT has_function_privilege('anon','public.get_prompt_by_api_token(text,uuid,text)','EXECUTE');
 ASSERT NOT has_function_privilege('anon','public.record_product_session(uuid)','EXECUTE');
 ASSERT NOT has_function_privilege('anon','public.record_template_saved(uuid,bigint,text)','EXECUTE');
 ASSERT (SELECT array_agg(p.proname::text ORDER BY p.proname)=ARRAY['get_prompt_by_api_token','record_product_session','record_template_saved']
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.prosecdef
   AND (has_function_privilege('anon',p.oid,'EXECUTE') OR has_function_privilege('authenticated',p.oid,'EXECUTE')));
 ASSERT (SELECT count(*)=1 FROM pg_policies WHERE schemaname='public' AND tablename='product_events'
  AND permissive='RESTRICTIVE' AND cmd='ALL' AND qual='false' AND with_check='false');
 ASSERT NOT has_table_privilege('anon','public.product_events','SELECT,INSERT,UPDATE,DELETE,TRUNCATE');
 ASSERT NOT has_table_privilege('authenticated','public.product_events','SELECT,INSERT,UPDATE,DELETE,TRUNCATE');
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
 ASSERT (SELECT status_code=401 AND content IS NULL FROM public.get_prompt_by_api_token('invalid','b0000000-0000-0000-0000-000000000001',NULL));
 ASSERT (SELECT status_code=401 AND content IS NULL FROM public.get_prompt_by_api_token('synthetic-expired','b0000000-0000-0000-0000-000000000001',NULL));
 ASSERT (SELECT status_code=404 AND content IS NULL FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000002',NULL));
 ASSERT (SELECT status_code=404 AND content IS NULL FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000002','0.9.0'));
 ASSERT (SELECT status_code=404 FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000001','missing'));
 BEGIN
  PERFORM public.record_product_session('d0000000-0000-0000-0000-000000000001');
  RAISE EXCEPTION 'Anonymous event RPC unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 ASSERT NOT EXISTS (SELECT 1 FROM public.product_events WHERE event_name IN ('api_used','api_first_used'));
 ASSERT NOT EXISTS (SELECT 1 FROM public.api_tokens WHERE last_used_at IS NOT NULL);
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
 ASSERT (SELECT status_code=200 AND content='current A' FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000001',NULL));
 ASSERT (SELECT status_code=200 AND content='historical A' FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000001','1.0.0'));
END $$;
RESET ROLE;
DO $$ BEGIN
 ASSERT (SELECT count(*)=2 FROM public.product_events WHERE event_name='api_used');
 ASSERT (SELECT count(*)=1 FROM public.product_events WHERE event_name='api_first_used');
 ASSERT (SELECT last_used_at IS NOT NULL FROM public.api_tokens WHERE token='synthetic-valid');
END $$;
DELETE FROM public.api_tokens WHERE token='synthetic-valid';
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT (SELECT status_code=401 FROM public.get_prompt_by_api_token('synthetic-valid','b0000000-0000-0000-0000-000000000001',NULL)); END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
  PERFORM public.record_product_session('d0000000-0000-0000-0000-000000000001');
  RAISE EXCEPTION 'Missing identity unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','a0000000-0000-0000-0000-000000000001',true);
DO $$ BEGIN
 ASSERT NOT public.record_product_session('d0000000-0000-0000-0000-000000000001');
 ASSERT NOT public.record_product_session('d0000000-0000-0000-0000-000000000001');
 ASSERT public.record_product_session('d0000000-0000-0000-0000-000000000002');
 ASSERT public.record_template_saved('b0000000-0000-0000-0000-000000000001',900001,'templates');
 ASSERT NOT public.record_template_saved('b0000000-0000-0000-0000-000000000001',900001,'templates');
 BEGIN
  PERFORM public.record_template_saved('b0000000-0000-0000-0000-000000000002',900001,'templates');
  RAISE EXCEPTION 'Cross-user template event unexpectedly allowed';
 EXCEPTION WHEN SQLSTATE 'PT404' THEN NULL; END;
 BEGIN
  PERFORM public.record_template_saved('b0000000-0000-0000-0000-000000000001',900001,'untrusted');
  RAISE EXCEPTION 'Invalid event source unexpectedly allowed';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  PERFORM public.record_template_saved('b0000000-0000-0000-0000-000000000001',900001,NULL);
  RAISE EXCEPTION 'Null event source unexpectedly allowed';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 ASSERT (SELECT count(*)=2 FROM public.product_events WHERE event_name='session_started');
 ASSERT (SELECT count(*)=1 FROM public.product_events WHERE event_name='second_session_started');
 ASSERT (SELECT count(*)=1 FROM public.product_events WHERE event_name='template_saved');
 ASSERT NOT EXISTS (SELECT 1 FROM public.product_events WHERE user_id='a0000000-0000-0000-0000-000000000002' AND event_name IN ('session_started','template_saved'));
END $$;

-- Defense in depth: even accidental future grants and permissive policies fail.
GRANT SELECT,INSERT,UPDATE,DELETE ON public.product_events TO anon,authenticated;
CREATE POLICY "Synthetic accidental grant" ON public.product_events FOR ALL TO anon,authenticated USING (true) WITH CHECK (true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE changed integer; BEGIN
 ASSERT NOT EXISTS (SELECT 1 FROM public.product_events);
 UPDATE public.product_events SET source='api';
 GET DIAGNOSTICS changed=ROW_COUNT; ASSERT changed=0;
 DELETE FROM public.product_events;
 GET DIAGNOSTICS changed=ROW_COUNT; ASSERT changed=0;
 BEGIN
  INSERT INTO public.product_events(user_id,event_name,event_key,source)
  VALUES ('a0000000-0000-0000-0000-000000000001','session_started','synthetic-direct','web');
  RAISE EXCEPTION 'Direct event insert unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
