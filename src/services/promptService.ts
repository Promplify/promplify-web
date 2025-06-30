import { supabase, supabaseUrl } from "@/lib/supabase";
import { Category, Prompt } from "@/types/prompt";

// Prompts
export const getPrompts = async (userId: string, categoryId?: string) => {
  let query = supabase
    .from("prompts")
    .select(
      `
      *,
      prompt_tags(tags(*))
    `
    )
    .eq("user_id", userId);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getPromptById = async (id: string) => {
  const { data, error } = await supabase
    .from("prompts")
    .select(
      `
      *,
      prompt_tags(tags(*))
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createPrompt = async (prompt: Omit<Prompt, "created_at" | "updated_at">) => {
  const { prompt_tags, ...promptData } = prompt;
  const { data, error } = await supabase.from("prompts").insert([promptData]).select().single();
  if (error) throw error;

  // If there are tags, add associations
  if (prompt_tags && prompt_tags.length > 0) {
    for (const pt of prompt_tags) {
      await addTagToPrompt(data.id, pt.tags.id);
    }
  }

  return data;
};

export const updatePrompt = async (id: string, prompt: Partial<Prompt>) => {
  const { prompt_tags, ...promptData } = prompt;
  const { error } = await supabase.from("prompts").update(promptData).eq("id", id);
  if (error) throw error;

  // If there are tags, first delete all existing tags, then add new ones
  if (prompt_tags !== undefined) {
    await supabase.from("prompt_tags").delete().eq("prompt_id", id);
    if (prompt_tags.length > 0) {
      for (const pt of prompt_tags) {
        await addTagToPrompt(id, pt.tags.id);
      }
    }
  }
};

export const deletePrompt = async (id: string) => {
  const { error } = await supabase.from("prompts").delete().eq("id", id);

  if (error) throw error;
};

export const toggleFavorite = async (id: string, isFavorite: boolean) => {
  const { data, error } = await supabase.from("prompts").update({ is_favorite: isFavorite }).eq("id", id).select().single();

  if (error) throw error;
  return data;
};

// Categories
export const getCategories = async (userId: string) => {
  const { data: categories, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      prompts (count)
    `
    )
    .eq("user_id", userId)
    .order("name");

  if (error) throw error;

  return categories.map((category) => ({
    ...category,
    prompt_count: category.prompts[0]?.count || 0,
  }));
};

export const createCategory = async (category: { name: string; user_id: string }) => {
  const { data, error } = await supabase.from("categories").insert(category).select().single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const { data, error } = await supabase.from("categories").update(category).eq("id", id).select().single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw error;
};

// Tags
export const getTags = async () => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  const { data, error } = await supabase.from("tags").select("*").eq("user_id", session.data.session.user.id).order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }

  return data;
};

export const getTagsByPromptId = async (promptId: string) => {
  const { data, error } = await supabase.from("prompt_tags").select("tags(id, name)").eq("prompt_id", promptId);
  if (error) throw error;
  // Return tag objects array
  return data?.map((item) => item.tags) || [];
};

export const createTag = async (name: string) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  // Clean and validate tag name
  const cleanedName = name.trim();

  // Check if it's a valid JSON object or array
  try {
    const parsed = JSON.parse(cleanedName);
    // Only treat as JSON if the result is an object or array
    if (typeof parsed === "object" && parsed !== null) {
      throw new Error("Tag name cannot be a JSON object or array");
    }
  } catch (e) {
    // JSON.parse failed, meaning it's not a JSON string, can continue
    if (e.message === "Tag name cannot be a JSON object or array") {
      throw e;
    }
  }

  // Check special characters
  if (/[{}[\]"']/.test(cleanedName)) {
    throw new Error("Tag name cannot contain special characters like {}, [], \", or '");
  }

  // First check if the tag already exists for this user
  const { data: existingTag } = await supabase.from("tags").select("*").eq("user_id", session.data.session.user.id).eq("name", cleanedName).single();

  if (existingTag) {
    return existingTag;
  }

  const { data, error } = await supabase
    .from("tags")
    .insert([
      {
        name: cleanedName,
        user_id: session.data.session.user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating tag:", error);
    throw error;
  }

  return data;
};

export const addTagToPrompt = async (promptId: string, tagId: string) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  // Verify the tag belongs to the user
  const { data: tagData } = await supabase.from("tags").select("*").eq("id", tagId).eq("user_id", session.data.session.user.id).single();

  if (!tagData) {
    throw new Error("Tag not found or not owned by user");
  }

  const { error } = await supabase.from("prompt_tags").insert({ prompt_id: promptId, tag_id: tagId });

  if (error) {
    console.error("Error adding tag to prompt:", error);
    throw error;
  }
};

export const removeTagFromPrompt = async (promptId: string, tagId: string) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  // Verify the tag belongs to the user
  const { data: tagData } = await supabase.from("tags").select("*").eq("id", tagId).eq("user_id", session.data.session.user.id).single();

  if (!tagData) {
    throw new Error("Tag not found or not owned by user");
  }

  const { error } = await supabase.from("prompt_tags").delete().eq("prompt_id", promptId).eq("tag_id", tagId);

  if (error) {
    console.error("Error removing tag from prompt:", error);
    throw error;
  }
};

export const createPromptWithCategory = async (prompt: Omit<Prompt, "id" | "created_at" | "updated_at">, categoryName: string) => {
  // First get the category list
  const categories = await getCategories(prompt.user_id);
  const category = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());

  if (!category) {
    throw new Error(`Category ${categoryName} not found`);
  }

  // Use the found category.id to create prompt
  const promptWithValidCategory = {
    ...prompt,
    category_id: category.id,
    id: crypto.randomUUID(),
  };

  return createPrompt(promptWithValidCategory);
};

export const optimizeSystemPrompt = async (systemPrompt: string) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  if (!systemPrompt) {
    throw new Error("System prompt is required");
  }

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/optimize-system-prompt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.optimizedPrompt) {
        throw new Error("Invalid response from optimization service");
      }

      return data.optimizedPrompt;
    } catch (error) {
      retryCount++;

      if (retryCount === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  throw new Error("Failed to optimize system prompt after multiple attempts");
};

export const exportUserData = async (userId: string) => {
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").eq("user_id", userId).order("name");

  if (categoriesError) throw categoriesError;

  // Get all prompts with their tags
  const { data: prompts, error: promptsError } = await supabase
    .from("prompts")
    .select(
      `
      *,
      prompt_tags(tags(*))
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (promptsError) throw promptsError;

  // Get all tags
  const { data: tags, error: tagsError } = await supabase.from("tags").select("*").eq("user_id", userId);

  if (tagsError) throw tagsError;

  // Remove sensitive fields
  const cleanedCategories = categories.map(({ id, user_id, ...rest }) => rest);
  const cleanedPrompts = prompts.map(({ id, user_id, category_id, ...rest }) => ({
    ...rest,
    prompt_tags: rest.prompt_tags?.map((pt) => ({
      tags: {
        name: pt.tags.name,
      },
    })),
  }));
  const cleanedTags = tags.map(({ id, user_id, ...rest }) => rest);

  return {
    categories: cleanedCategories,
    prompts: cleanedPrompts,
    tags: cleanedTags,
    exported_at: new Date().toISOString(),
  };
};
