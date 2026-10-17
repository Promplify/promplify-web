-- Run after all migrations in an isolated database. Synthetic fixtures only.
BEGIN;
INSERT INTO auth.users(id) VALUES
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003');
UPDATE public.profiles SET full_name = 'Synthetic Author', username = 'synthetic-' || right(id::text, 1),
 avatar_url = 'https://example.invalid/avatar.png', bio = 'private bio',
 company = 'private company', location = 'private location', website = 'private website';
INSERT INTO public.prompts(id,user_id,title) VALUES
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Public synthetic prompt'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Private synthetic prompt');
INSERT INTO public.plaza_prompts(id,prompt_id,user_id) VALUES
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001'),
 -- A bogus publisher/owner pairing must not qualify user C.
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003');
INSERT INTO public.prompt_shares(prompt_id,share_token,created_by) VALUES
 ('10000000-0000-0000-0000-000000000002','synthetic-private-token','00000000-0000-0000-0000-000000000002');
INSERT INTO public.prompt_template(id,title,system_prompt) VALUES (900001,'Synthetic template','Synthetic system prompt');

DO $$ BEGIN
 ASSERT (SELECT count(*) = 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd IN ('SELECT','ALL'));
 ASSERT (SELECT array_agg(column_name::text ORDER BY ordinal_position) = ARRAY['id','username','full_name','avatar_url'] FROM information_schema.columns WHERE table_schema='public' AND table_name='public_authors');
 ASSERT (SELECT reloptions @> ARRAY['security_barrier=true','security_invoker=false'] FROM pg_class WHERE oid='public.public_authors'::regclass);
 ASSERT NOT has_table_privilege('anon','public.profiles','SELECT');
 ASSERT NOT has_table_privilege('authenticated','public.profiles','TRUNCATE');
 ASSERT NOT has_table_privilege('authenticated','public.profiles','DELETE');
 ASSERT (SELECT pg_get_userbyid(relowner)='postgres' FROM pg_class WHERE oid='public.public_authors'::regclass);
 ASSERT NOT has_table_privilege('anon','public.public_authors','UPDATE');
 ASSERT NOT has_table_privilege('authenticated','public.public_authors','INSERT');
 ASSERT NOT has_function_privilege('anon','public.handle_new_user()','EXECUTE');
 ASSERT NOT has_function_privilege('authenticated','public.validate_api_token(text)','EXECUTE');
END $$;

SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN
   PERFORM * FROM public.profiles;
   RAISE EXCEPTION 'Anonymous profile access unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 ASSERT (SELECT count(*)=1 FROM public.public_authors);
 ASSERT (SELECT full_name='Synthetic Author' AND username='synthetic-1' FROM public.public_authors WHERE id='00000000-0000-0000-0000-000000000001');
 ASSERT NOT EXISTS (SELECT 1 FROM public.public_authors WHERE id IN ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003'));
 BEGIN
   PERFORM bio FROM public.public_authors;
   RAISE EXCEPTION 'Private column unexpectedly exposed';
 EXCEPTION WHEN undefined_column THEN NULL; END;
 BEGIN
   UPDATE public.public_authors SET full_name='tampered';
   RAISE EXCEPTION 'Anonymous projection write unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 ASSERT NOT EXISTS (SELECT 1 FROM public.get_shared_prompt_by_token('invalid-synthetic-token'));
 ASSERT (SELECT prompt_title='Private synthetic prompt' AND views=1 FROM public.get_shared_prompt_by_token('synthetic-private-token'));
 ASSERT NOT EXISTS (SELECT 1 FROM public.public_authors WHERE id='00000000-0000-0000-0000-000000000002');
 ASSERT public.increment_template_views(900001)=1;
END $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$ BEGIN ASSERT NOT EXISTS (SELECT 1 FROM public.profiles); END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
DO $$ DECLARE n integer; BEGIN
 ASSERT (SELECT count(*)=1 FROM public.profiles);
 ASSERT (SELECT bio='private bio' AND company='private company' AND location='private location' AND website='private website' FROM public.profiles);
 ASSERT NOT EXISTS (SELECT 1 FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000002');
 UPDATE public.profiles SET bio='own updated bio' WHERE id='00000000-0000-0000-0000-000000000001';
 GET DIAGNOSTICS n = ROW_COUNT; ASSERT n=1;
 UPDATE public.profiles SET bio='cross-user overwrite' WHERE id='00000000-0000-0000-0000-000000000002';
 GET DIAGNOSTICS n = ROW_COUNT; ASSERT n=0;
 BEGIN
   UPDATE public.profiles SET id='00000000-0000-0000-0000-000000000004';
   RAISE EXCEPTION 'Ownership transfer unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   INSERT INTO public.profiles(id) VALUES ('00000000-0000-0000-0000-000000000004');
   RAISE EXCEPTION 'Cross-user insert unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   UPDATE public.public_authors SET full_name='tampered';
   RAISE EXCEPTION 'Authenticated projection write unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 ASSERT (SELECT count(*)=1 FROM public.public_authors);
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
DO $$ BEGIN
 ASSERT (SELECT count(*)=1 FROM public.profiles);
 ASSERT NOT EXISTS (SELECT 1 FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000001');
 ASSERT (SELECT bio='private bio' FROM public.profiles);
 UPDATE public.profiles SET full_name='Synthetic B updated';
 ASSERT (SELECT full_name='Synthetic B updated' FROM public.profiles);
 ASSERT (SELECT count(*)=1 FROM public.public_authors);
END $$;
RESET ROLE;

-- Updates are live; deleting the final genuine publication immediately unlists A.
UPDATE public.profiles SET full_name='Synthetic A updated' WHERE id='00000000-0000-0000-0000-000000000001';
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT (SELECT full_name='Synthetic A updated' FROM public.public_authors); END $$;
RESET ROLE;
DELETE FROM public.plaza_prompts WHERE id='20000000-0000-0000-0000-000000000001';
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT NOT EXISTS (SELECT 1 FROM public.public_authors); END $$;
RESET ROLE;

-- Owner INSERT remains available if an account's profile needs recreating.
DELETE FROM public.profiles WHERE id='00000000-0000-0000-0000-000000000003';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
INSERT INTO public.profiles(id,full_name) VALUES ('00000000-0000-0000-0000-000000000003','Synthetic recreated profile');
DO $$ BEGIN ASSERT (SELECT full_name='Synthetic recreated profile' FROM public.profiles); END $$;

-- Publishing/unpublishing one's own prompt controls public author eligibility.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
INSERT INTO public.plaza_prompts(id,prompt_id,user_id) VALUES
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002');
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT (SELECT count(*)=1 FROM public.public_authors WHERE id='00000000-0000-0000-0000-000000000002'); END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DELETE FROM public.plaza_prompts WHERE id='20000000-0000-0000-0000-000000000002';
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT NOT EXISTS (SELECT 1 FROM public.public_authors); END $$;
RESET ROLE;
ROLLBACK;
