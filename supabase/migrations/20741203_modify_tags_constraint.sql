-- Remove existing global unique constraint
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key;

-- Add composite unique constraint to ensure tag names are unique within each user's scope
ALTER TABLE tags ADD CONSTRAINT tags_name_user_id_key UNIQUE (name, user_id);

-- Ensure user_id is not null since it's now part of the composite unique constraint
ALTER TABLE tags ALTER COLUMN user_id SET NOT NULL;

-- Add index to improve query performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
