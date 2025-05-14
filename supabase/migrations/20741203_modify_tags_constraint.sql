-- 删除现有的全局唯一约束
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key;

-- 添加复合唯一约束，确保标签名称在每个用户范围内唯一
ALTER TABLE tags ADD CONSTRAINT tags_name_user_id_key UNIQUE (name, user_id);

-- 确保user_id不为空，因为它现在是复合唯一约束的一部分
ALTER TABLE tags ALTER COLUMN user_id SET NOT NULL;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
