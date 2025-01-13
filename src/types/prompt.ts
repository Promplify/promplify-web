export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content?: string;
  system_prompt: string;
  user_prompt: string;
  version: string;
  token_count: number;
  performance: number;
  is_favorite: boolean;
  category_id: string;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
  prompt_tags?: { tags: Tag }[];
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  created_at?: string;
}

export interface PromptTag {
  prompt_id: string;
  tag_id: string;
}
