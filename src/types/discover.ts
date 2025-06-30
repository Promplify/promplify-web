import { Prompt } from "./prompt";

export interface DiscoverPrompt {
  id: string;
  prompt_id: string;
  user_id: string;
  likes_count: number;
  created_at: string;
  cover_image_url?: string;
  is_featured: boolean;
  prompt?: Prompt;
  user_has_liked?: boolean;
}

export interface DiscoverLike {
  id: string;
  discover_prompt_id: string;
  user_id: string;
  created_at: string;
}
