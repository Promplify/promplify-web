import { validateApiToken } from "../lib/api-auth";
import { supabase } from "../lib/supabase";

export async function getPrompt(promptId: string, version?: string, authToken?: string) {
  try {
    // Validate API token
    if (!authToken) {
      return { error: "Missing authorization token" };
    }

    const { userId, error: authError } = await validateApiToken(authToken);
    if (authError) {
      return { error: authError };
    }

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Build base query
    let queryBuilder = supabase.from("prompts").select("*").eq("id", promptId).eq("user_id", userId);

    // Add version filter or get latest
    if (version) {
      queryBuilder = queryBuilder.eq("version", version);
    } else {
      // Get latest version if no version specified
      queryBuilder = queryBuilder.order("version", { ascending: false }).limit(1);
    }

    // Execute query
    const { data: prompt, error } = await queryBuilder.single();

    if (error) {
      if (error.code === "PGRST116") {
        return { error: "Prompt not found" };
      }
      return { error: "Failed to fetch prompt" };
    }

    if (!prompt) {
      return { error: "Prompt not found" };
    }

    // Filter out unwanted fields
    const { id, user_id, performance, ...filteredPrompt } = prompt;
    return filteredPrompt;
  } catch (error) {
    return { error: "Internal server error" };
  }
}
