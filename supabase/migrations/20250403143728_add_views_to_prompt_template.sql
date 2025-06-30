-- Add views column to prompt_template table
ALTER TABLE prompt_template ADD COLUMN views INTEGER DEFAULT 0;

-- Update existing rows to have 0 views
UPDATE prompt_template SET views = 0 WHERE views IS NULL;
