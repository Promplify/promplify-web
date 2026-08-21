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

export type DiscoverSort = "likes_count" | "created_at";

export interface DiscoverPromptRow extends Omit<DiscoverPrompt, "user_has_liked"> {
  user_has_liked?: Array<{ user_id: string }>;
}

export interface DiscoverProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface DiscoverLike {
  id: string;
  discover_prompt_id: string;
  user_id: string;
  created_at: string;
}
