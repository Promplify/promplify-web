-- Rollback material generated from pre-fix snapshot
-- Snapshot: 20260401_171355

-- Function definitions (copy/paste as needed)

-- get_prompt_versions(uuid)
CREATE OR REPLACE FUNCTION public.get_prompt_versions(p_prompt_id uuid)
 RETURNS TABLE(version character varying, content text, system_prompt text, user_prompt text, token_count integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
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
    FROM prompt_versions pv
    WHERE pv.prompt_id = p_prompt_id
    ORDER BY pv.created_at DESC;
END;
$function$
;

-- handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$function$
;

-- update_plaza_prompt_likes_count()
CREATE OR REPLACE FUNCTION public.update_plaza_prompt_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plaza_prompts
    SET likes_count = likes_count + 1
    WHERE id = NEW.plaza_prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plaza_prompts
    SET likes_count = likes_count - 1
    WHERE id = OLD.plaza_prompt_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

-- update_updated_at_column()
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
;

-- Policy definitions (recreate after dropping current policies if needed)

DROP POLICY IF EXISTS "API tokens can be validated by token" ON public.api_tokens;
CREATE POLICY "API tokens can be validated by token" ON public.api_tokens
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "Users can delete own tokens" ON public.api_tokens;
CREATE POLICY "Users can delete own tokens" ON public.api_tokens
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can insert own tokens" ON public.api_tokens;
CREATE POLICY "Users can insert own tokens" ON public.api_tokens
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can view own tokens" ON public.api_tokens;
CREATE POLICY "Users can view own tokens" ON public.api_tokens
FOR SELECT
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "Users can delete their own categories" ON public.categories
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
CREATE POLICY "Users can insert their own categories" ON public.categories
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "Users can update their own categories" ON public.categories
FOR UPDATE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
CREATE POLICY "Users can view their own categories" ON public.categories
FOR SELECT
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.plaza_likes;
CREATE POLICY "Allow delete for authenticated" ON public.plaza_likes
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.plaza_likes;
CREATE POLICY "Allow insert for authenticated" ON public.plaza_likes
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Allow select for all" ON public.plaza_likes;
CREATE POLICY "Allow select for all" ON public.plaza_likes
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "Allow update for authenticated" ON public.plaza_likes;
CREATE POLICY "Allow update for authenticated" ON public.plaza_likes
FOR UPDATE
TO public
USING ((auth.uid() = user_id))
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "所有用户可以查看点赞" ON public.plaza_likes;
CREATE POLICY "所有用户可以查看点赞" ON public.plaza_likes
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "用户可以添加自己的点赞" ON public.plaza_likes;
CREATE POLICY "用户可以添加自己的点赞" ON public.plaza_likes
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "用户可以移除自己的点赞" ON public.plaza_likes;
CREATE POLICY "用户可以移除自己的点赞" ON public.plaza_likes
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can update likes_count of prompts" ON public.plaza_prompts;
CREATE POLICY "Users can update likes_count of prompts" ON public.plaza_prompts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true)
;

DROP POLICY IF EXISTS "所有用户可以查看公共广场内容" ON public.plaza_prompts;
CREATE POLICY "所有用户可以查看公共广场内容" ON public.plaza_prompts
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "用户可以分享自己的提示到广场" ON public.plaza_prompts;
CREATE POLICY "用户可以分享自己的提示到广场" ON public.plaza_prompts
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "用户可以删除自己分享的提示" ON public.plaza_prompts;
CREATE POLICY "用户可以删除自己分享的提示" ON public.plaza_prompts
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
FOR INSERT
TO public
WITH CHECK ((auth.uid() = id))
;

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
FOR UPDATE
TO public
USING ((auth.uid() = id))
;

DROP POLICY IF EXISTS "Anyone can view prompt tags" ON public.prompt_tags;
CREATE POLICY "Anyone can view prompt tags" ON public.prompt_tags
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM plaza_prompts
  WHERE (plaza_prompts.prompt_id = prompt_tags.prompt_id))))
;

DROP POLICY IF EXISTS "Users can delete their own prompt tags" ON public.prompt_tags;
CREATE POLICY "Users can delete their own prompt tags" ON public.prompt_tags
FOR DELETE
TO public
USING ((EXISTS ( SELECT 1
   FROM prompts
  WHERE ((prompts.id = prompt_tags.prompt_id) AND (prompts.user_id = auth.uid())))))
;

DROP POLICY IF EXISTS "Users can insert their own prompt tags" ON public.prompt_tags;
CREATE POLICY "Users can insert their own prompt tags" ON public.prompt_tags
FOR INSERT
TO public
WITH CHECK ((EXISTS ( SELECT 1
   FROM prompts
  WHERE ((prompts.id = prompt_tags.prompt_id) AND (prompts.user_id = auth.uid())))))
;

DROP POLICY IF EXISTS "Users can view their own prompt tags" ON public.prompt_tags;
CREATE POLICY "Users can view their own prompt tags" ON public.prompt_tags
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM prompts
  WHERE ((prompts.id = prompt_tags.prompt_id) AND (prompts.user_id = auth.uid())))))
;

DROP POLICY IF EXISTS "Allow public view count update" ON public.prompt_template;
CREATE POLICY "Allow public view count update" ON public.prompt_template
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true)
;

DROP POLICY IF EXISTS "Enable delete for service role only" ON public.prompt_template;
CREATE POLICY "Enable delete for service role only" ON public.prompt_template
FOR DELETE
TO public
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
;

DROP POLICY IF EXISTS "Enable insert for service role only" ON public.prompt_template;
CREATE POLICY "Enable insert for service role only" ON public.prompt_template
FOR INSERT
TO public
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.prompt_template;
CREATE POLICY "Enable read access for all users" ON public.prompt_template
FOR SELECT
TO public
USING (true)
;

DROP POLICY IF EXISTS "Enable update for service role only" ON public.prompt_template;
CREATE POLICY "Enable update for service role only" ON public.prompt_template
FOR UPDATE
TO public
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
;

DROP POLICY IF EXISTS "Users can insert their own prompt versions" ON public.prompt_versions;
CREATE POLICY "Users can insert their own prompt versions" ON public.prompt_versions
FOR INSERT
TO authenticated
WITH CHECK (((auth.uid() = created_by) AND (EXISTS ( SELECT 1
   FROM prompts
  WHERE ((prompts.id = prompt_versions.prompt_id) AND (prompts.user_id = auth.uid()))))))
;

DROP POLICY IF EXISTS "Users can view their own prompt versions" ON public.prompt_versions;
CREATE POLICY "Users can view their own prompt versions" ON public.prompt_versions
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM prompts
  WHERE ((prompts.id = prompt_versions.prompt_id) AND (prompts.user_id = auth.uid())))))
;

DROP POLICY IF EXISTS "Allow anonymous read access to plaza prompts" ON public.prompts;
CREATE POLICY "Allow anonymous read access to plaza prompts" ON public.prompts
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM plaza_prompts
  WHERE (plaza_prompts.prompt_id = prompts.id))))
;

DROP POLICY IF EXISTS "Allow anonymous read access to shared prompts" ON public.prompts;
CREATE POLICY "Allow anonymous read access to shared prompts" ON public.prompts
FOR SELECT
TO anon
USING ((EXISTS ( SELECT 1
   FROM prompt_shares
  WHERE (prompt_shares.prompt_id = prompts.id))))
;

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
CREATE POLICY "Users can delete their own prompts" ON public.prompts
FOR DELETE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can insert their own prompts" ON public.prompts;
CREATE POLICY "Users can insert their own prompts" ON public.prompts
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
CREATE POLICY "Users can update their own prompts" ON public.prompts
FOR UPDATE
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
CREATE POLICY "Users can view their own prompts" ON public.prompts
FOR SELECT
TO public
USING ((auth.uid() = user_id))
;

DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags" ON public.tags
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM (prompt_tags
     JOIN plaza_prompts ON ((prompt_tags.prompt_id = plaza_prompts.prompt_id)))
  WHERE (prompt_tags.tag_id = tags.id))))
;

DROP POLICY IF EXISTS "Everyone can create tags" ON public.tags;
CREATE POLICY "Everyone can create tags" ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (true)
;

DROP POLICY IF EXISTS "Everyone can view tags" ON public.tags;
CREATE POLICY "Everyone can view tags" ON public.tags
FOR SELECT
TO authenticated
USING (true)
;

DROP POLICY IF EXISTS "Users can create their own tags" ON public.tags;
CREATE POLICY "Users can create their own tags" ON public.tags
FOR INSERT
TO authenticated
WITH CHECK ((user_id = auth.uid()))
;

DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags;
CREATE POLICY "Users can delete their own tags" ON public.tags
FOR DELETE
TO authenticated
USING ((user_id = auth.uid()))
;

DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags;
CREATE POLICY "Users can update their own tags" ON public.tags
FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()))
;

DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags;
CREATE POLICY "Users can view their own tags" ON public.tags
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()))
;

-- Index definitions from snapshot (for selective re-create)

-- api_tokens.api_tokens_pkey
CREATE UNIQUE INDEX api_tokens_pkey ON public.api_tokens USING btree (id);

-- api_tokens.api_tokens_token_key
CREATE UNIQUE INDEX api_tokens_token_key ON public.api_tokens USING btree (token);

-- api_tokens.idx_api_tokens_token
CREATE INDEX idx_api_tokens_token ON public.api_tokens USING btree (token);

-- api_tokens.idx_api_tokens_user_id
CREATE INDEX idx_api_tokens_user_id ON public.api_tokens USING btree (user_id);

-- categories.categories_parent_id_idx
CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);

-- categories.categories_pkey
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

-- categories.categories_user_id_idx
CREATE INDEX categories_user_id_idx ON public.categories USING btree (user_id);

-- plaza_likes.idx_plaza_likes_plaza_prompt_id
CREATE INDEX idx_plaza_likes_plaza_prompt_id ON public.plaza_likes USING btree (plaza_prompt_id);

-- plaza_likes.idx_plaza_likes_user_id
CREATE INDEX idx_plaza_likes_user_id ON public.plaza_likes USING btree (user_id);

-- plaza_likes.plaza_likes_pkey
CREATE UNIQUE INDEX plaza_likes_pkey ON public.plaza_likes USING btree (id);

-- plaza_likes.plaza_likes_plaza_prompt_id_user_id_key
CREATE UNIQUE INDEX plaza_likes_plaza_prompt_id_user_id_key ON public.plaza_likes USING btree (plaza_prompt_id, user_id);

-- plaza_prompts.idx_plaza_prompts_created_at
CREATE INDEX idx_plaza_prompts_created_at ON public.plaza_prompts USING btree (created_at);

-- plaza_prompts.idx_plaza_prompts_likes_count
CREATE INDEX idx_plaza_prompts_likes_count ON public.plaza_prompts USING btree (likes_count);

-- plaza_prompts.idx_plaza_prompts_prompt_id
CREATE INDEX idx_plaza_prompts_prompt_id ON public.plaza_prompts USING btree (prompt_id);

-- plaza_prompts.idx_plaza_prompts_user_id
CREATE INDEX idx_plaza_prompts_user_id ON public.plaza_prompts USING btree (user_id);

-- plaza_prompts.plaza_prompts_pkey
CREATE UNIQUE INDEX plaza_prompts_pkey ON public.plaza_prompts USING btree (id);

-- profiles.profiles_pkey
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

-- profiles.profiles_username_key
CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

-- prompt_shares.prompt_shares_pkey
CREATE UNIQUE INDEX prompt_shares_pkey ON public.prompt_shares USING btree (id);

-- prompt_shares.prompt_shares_prompt_id_idx
CREATE INDEX prompt_shares_prompt_id_idx ON public.prompt_shares USING btree (prompt_id);

-- prompt_shares.prompt_shares_share_token_idx
CREATE INDEX prompt_shares_share_token_idx ON public.prompt_shares USING btree (share_token);

-- prompt_shares.prompt_shares_share_token_key
CREATE UNIQUE INDEX prompt_shares_share_token_key ON public.prompt_shares USING btree (share_token);

-- prompt_tags.prompt_tags_pkey
CREATE UNIQUE INDEX prompt_tags_pkey ON public.prompt_tags USING btree (prompt_id, tag_id);

-- prompt_tags.prompt_tags_prompt_id_idx
CREATE INDEX prompt_tags_prompt_id_idx ON public.prompt_tags USING btree (prompt_id);

-- prompt_tags.prompt_tags_tag_id_idx
CREATE INDEX prompt_tags_tag_id_idx ON public.prompt_tags USING btree (tag_id);

-- prompt_template.idx_prompt_template_category
CREATE INDEX idx_prompt_template_category ON public.prompt_template USING btree (category);

-- prompt_template.idx_prompt_template_title
CREATE INDEX idx_prompt_template_title ON public.prompt_template USING btree (title);

-- prompt_template.prompt_template_pkey
CREATE UNIQUE INDEX prompt_template_pkey ON public.prompt_template USING btree (id);

-- prompt_versions.prompt_versions_pkey
CREATE UNIQUE INDEX prompt_versions_pkey ON public.prompt_versions USING btree (id);

-- prompts.prompts_category_id_idx
CREATE INDEX prompts_category_id_idx ON public.prompts USING btree (category_id);

-- prompts.prompts_pkey
CREATE UNIQUE INDEX prompts_pkey ON public.prompts USING btree (id);

-- prompts.prompts_user_id_idx
CREATE INDEX prompts_user_id_idx ON public.prompts USING btree (user_id);

-- tags.idx_tags_name
CREATE INDEX idx_tags_name ON public.tags USING btree (name);

-- tags.idx_tags_user_id
CREATE INDEX idx_tags_user_id ON public.tags USING btree (user_id);

-- tags.tags_name_idx
CREATE INDEX tags_name_idx ON public.tags USING btree (name);

-- tags.tags_name_user_id_key
CREATE UNIQUE INDEX tags_name_user_id_key ON public.tags USING btree (name, user_id);

-- tags.tags_pkey
CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

-- tags.unique_tag_name_per_user
CREATE UNIQUE INDEX unique_tag_name_per_user ON public.tags USING btree (user_id, name);
