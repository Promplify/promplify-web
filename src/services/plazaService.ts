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

  // First verify that a corresponding record exists in plaza_prompts and get current likes_count
  const { data: promptData, error: promptError } = await supabase.from("plaza_prompts").select("id, likes_count").eq("id", discoverPromptId).single();

  if (promptError) {
    console.error("Error checking prompt existence:", promptError);
    throw new Error(`Plaza prompt ${discoverPromptId} not found: ${promptError.message}`);
  }

  // Get current likes_count
  const currentLikesCount = promptData.likes_count || 0;

  try {
    // 1. Check if user has already liked
    const { data: existingLike, error: checkError } = await supabase.from("plaza_likes").select("id").eq("plaza_prompt_id", discoverPromptId).eq("user_id", userId).maybeSingle();

    if (checkError) {
      console.error("Error checking existing like:", checkError);
    }

    // If user has already liked, return directly
    if (existingLike) {
      console.log("User already liked this prompt");
      return existingLike;
    }

    // 2. Add like record
    const { data, error } = await supabase
      .from("plaza_likes")
      .insert([{ plaza_prompt_id: discoverPromptId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error("Error adding like:", error);
      throw error;
    }

    // 3. Directly update likes_count in plaza_prompts table (important change)
    console.log(`Updating likes_count for prompt ${discoverPromptId} from ${currentLikesCount} to ${currentLikesCount + 1}`);
    const { error: updateError } = await supabase
      .from("plaza_prompts")
      .update({ likes_count: currentLikesCount + 1 })
      .eq("id", discoverPromptId);

    if (updateError) {
      console.error("Error updating likes_count:", updateError);
      console.error("Full error object:", JSON.stringify(updateError));
    }

    return data;
  } catch (error: any) {
    console.error("Failed to like prompt:", error);
    throw error;
  }
};

// Unlike a prompt
export const unlikeDiscoverPrompt = async (discoverPromptId: string) => {
  // Get current user ID
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) throw new Error("User not authenticated");

  // First get current likes_count
  const { data: promptData, error: promptError } = await supabase.from("plaza_prompts").select("id, likes_count").eq("id", discoverPromptId).single();

  if (promptError) {
    console.error("Error checking prompt existence:", promptError);
    throw new Error(`Plaza prompt ${discoverPromptId} not found: ${promptError.message}`);
  }

  // Get current likes_count
  const currentLikesCount = promptData.likes_count || 0;

  try {
    // 1. Check if user has already liked
    const { data: existingLike, error: checkError } = await supabase.from("plaza_likes").select("id").eq("plaza_prompt_id", discoverPromptId).eq("user_id", userId).maybeSingle();

    if (checkError) {
      console.error("Error checking existing like:", checkError);
    }

    // If user hasn't liked, return directly
    if (!existingLike) {
      console.log("User hasn't liked this prompt");
      return true;
    }

    // 2. Remove like
    const { error } = await supabase.from("plaza_likes").delete().eq("plaza_prompt_id", discoverPromptId).eq("user_id", userId);

    if (error) {
      console.error("Error removing like:", error);
      throw error;
    }

    // 3. Directly update likes_count in plaza_prompts table, ensure it's not negative
    const newLikesCount = Math.max(0, currentLikesCount - 1);
    console.log(`Updating likes_count for prompt ${discoverPromptId} from ${currentLikesCount} to ${newLikesCount}`);
    const { error: updateError } = await supabase.from("plaza_prompts").update({ likes_count: newLikesCount }).eq("id", discoverPromptId);

    if (updateError) {
      console.error("Error updating likes_count:", updateError);
      console.error("Full error object:", JSON.stringify(updateError));
    }

    return true;
  } catch (error) {
    console.error("Failed to unlike prompt:", error);
    throw error;
  }
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
