-- Create plaza prompts table
CREATE TABLE IF NOT EXISTS plaza_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cover_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_plaza_prompts_user_id ON plaza_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_plaza_prompts_prompt_id ON plaza_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_plaza_prompts_likes_count ON plaza_prompts(likes_count);
CREATE INDEX IF NOT EXISTS idx_plaza_prompts_created_at ON plaza_prompts(created_at);

-- Create likes table
CREATE TABLE IF NOT EXISTS plaza_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plaza_prompt_id UUID NOT NULL REFERENCES plaza_prompts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(plaza_prompt_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_plaza_likes_user_id ON plaza_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_plaza_likes_plaza_prompt_id ON plaza_likes(plaza_prompt_id);

-- Enable row level security
ALTER TABLE plaza_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaza_likes ENABLE ROW LEVEL SECURITY;

-- Plaza prompts security policies
CREATE POLICY "Anyone can view plaza prompts" ON plaza_prompts
    FOR SELECT USING (true);

CREATE POLICY "Users can share their own prompts to plaza" ON plaza_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared prompts" ON plaza_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Likes security policies
CREATE POLICY "Anyone can view likes" ON plaza_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can add their own likes" ON plaza_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON plaza_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to update like count
CREATE OR REPLACE FUNCTION update_plaza_prompt_likes_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers for likes table
CREATE TRIGGER update_likes_count_on_insert
AFTER INSERT ON plaza_likes
FOR EACH ROW
EXECUTE FUNCTION update_plaza_prompt_likes_count();

CREATE TRIGGER update_likes_count_on_delete
AFTER DELETE ON plaza_likes
FOR EACH ROW
EXECUTE FUNCTION update_plaza_prompt_likes_count(); 