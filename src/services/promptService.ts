import { supabase } from "@/lib/supabase";
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

export const createTag = async (name: string) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session?.user.id) {
    throw new Error("No user session");
  }

  // 清理和验证 tag 名称
  const cleanedName = name.trim();

  // 检查是否是有效的 JSON 对象或数组
  try {
    const parsed = JSON.parse(cleanedName);
    // 只有当解析结果是对象或数组时才认为是 JSON
    if (typeof parsed === "object" && parsed !== null) {
      throw new Error("Tag name cannot be a JSON object or array");
    }
  } catch (e) {
    // JSON.parse 解析失败，说明不是 JSON 字符串，可以继续
    if (e.message === "Tag name cannot be a JSON object or array") {
      throw e;
    }
  }

  // 检查特殊字符
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

  try {
    const { data, error } = await supabase.functions.invoke("optimize-system-prompt", {
      body: { systemPrompt },
    });

    if (error) throw error;
    return data.optimizedPrompt;
  } catch (error) {
    console.error("Error optimizing system prompt:", error);
    throw error;
  }
};
