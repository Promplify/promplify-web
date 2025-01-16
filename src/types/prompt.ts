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
  system_tokens: number;
  user_tokens: number;
  performance: number;
  is_favorite: boolean;
  category_id: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at?: string;
  updated_at?: string;
  prompt_tags?: { tags: Tag }[];
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

export type Category = {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
  parent_id?: string | null;
  subcategories?: Category[];
  icon?: string;
};

export interface PromptTag {
  prompt_id: string;
  tag_id: string;
}
