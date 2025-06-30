-- Create api_tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(token_hash)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_token_hash ON api_tokens(token_hash);

-- Add RLS policies
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens
CREATE POLICY "Users can view own tokens"
    ON api_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own tokens
CREATE POLICY "Users can insert own tokens"
    ON api_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own tokens
CREATE POLICY "Users can delete own tokens"
    ON api_tokens FOR DELETE
    USING (auth.uid() = user_id); 