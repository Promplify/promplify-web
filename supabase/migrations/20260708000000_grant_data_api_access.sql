-- Grant only the table privileges required by the browser-facing Data API.
-- Row Level Security remains the authorization boundary for every operation.

GRANT SELECT ON TABLE public.prompt_template TO anon, authenticated;
GRANT UPDATE ON TABLE public.prompt_template TO anon, authenticated;

GRANT SELECT ON TABLE public.prompts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.prompts TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.prompt_tags TO authenticated;
GRANT SELECT, INSERT ON TABLE public.prompt_versions TO authenticated;

GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.prompt_shares TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.prompt_shares TO anon;

GRANT SELECT ON TABLE public.plaza_prompts TO anon, authenticated;
GRANT INSERT, DELETE ON TABLE public.plaza_prompts TO authenticated;
GRANT SELECT ON TABLE public.plaza_likes TO anon, authenticated;
GRANT INSERT, DELETE ON TABLE public.plaza_likes TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.api_tokens TO authenticated;

REVOKE ALL ON FUNCTION public.get_prompt_versions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_prompt_versions(uuid) TO authenticated;
