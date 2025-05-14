import { supabase } from "@/lib/supabase";

// Get all prompts from discover
export const getDiscoverPrompts = async (limit = 20, offset = 0, sortBy = "likes_count") => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id;

  // Query discover prompts
  const { data, error, count } = await supabase
    .from("plaza_prompts")
    .select(
      `
      *,
      prompt:prompts(*),
      user_has_liked:plaza_likes!plaza_likes_plaza_prompt_id_fkey(user_id)
    `,
      { count: "exact" }
    )
    .order(sortBy as any, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Process user likes
  const processedData = data.map((item: any) => ({
    ...item,
    user_has_liked: item.user_has_liked?.some((like: any) => like.user_id === currentUserId) || false,
  }));

  return { data: processedData, count };
};

// Get featured prompts
export const getFeaturedDiscoverPrompts = async (limit = 5) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user?.id;

  const { data, error } = await supabase
    .from("plaza_prompts")
    .select(
      `
      *,
      prompt:prompts(*),
      user_has_liked:plaza_likes!plaza_likes_plaza_prompt_id_fkey(user_id)
    `
    )
    .eq("is_featured", true)
    .order("likes_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Process user likes
  const processedData = data.map((item: any) => ({
    ...item,
    user_has_liked: item.user_has_liked?.some((like: any) => like.user_id === currentUserId) || false,
  }));

  return processedData;
};

// Share a prompt to discover
export const sharePromptToDiscover = async (promptId: string) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Check if prompt is already shared
  const { data: existingPrompt } = await supabase.from("plaza_prompts").select("id").eq("prompt_id", promptId).eq("user_id", userId).single();

  if (existingPrompt) throw new Error("Prompt already shared to discover");

  // Share prompt to discover
  const { data, error } = await supabase
    .from("plaza_prompts")
    .insert([{ prompt_id: promptId, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Like a prompt
export const likeDiscoverPrompt = async (discoverPromptId: string) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Add like
  const { data, error } = await supabase
    .from("plaza_likes")
    .insert([{ plaza_prompt_id: discoverPromptId, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Unlike a prompt
export const unlikeDiscoverPrompt = async (discoverPromptId: string) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Remove like
  const { error } = await supabase.from("plaza_likes").delete().eq("plaza_prompt_id", discoverPromptId).eq("user_id", userId);

  if (error) throw error;
  return true;
};

// Save discover prompt to my list
export const saveDiscoverPromptToMyList = async (discoverPromptId: string) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // Get discover prompt details
  const { data: discoverPrompt, error: discoverError } = await supabase
    .from("plaza_prompts")
    .select(
      `
      *,
      prompt:prompts(*)
    `
    )
    .eq("id", discoverPromptId)
    .single();

  if (discoverError) throw discoverError;
  if (!discoverPrompt.prompt) throw new Error("Prompt not found");

  // Copy prompt to user's list
  const originalPrompt = discoverPrompt.prompt;
  const { data: newPrompt, error } = await supabase
    .from("prompts")
    .insert([
      {
        title: originalPrompt.title,
        description: originalPrompt.description ? originalPrompt.description : `Saved from Discover`,
        content: originalPrompt.content,
        system_prompt: originalPrompt.system_prompt,
        user_prompt: originalPrompt.user_prompt,
        version: originalPrompt.version,
        model: originalPrompt.model,
        temperature: originalPrompt.temperature,
        max_tokens: originalPrompt.max_tokens,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newPrompt;
};
