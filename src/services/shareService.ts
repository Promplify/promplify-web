import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export interface ShareRecord {
  id: string;
  prompt_id: string;
  share_token: string;
  views: number;
  created_at: string;
  created_by: string;
}

// Base62 character set (0-9, A-Z, a-z)
const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Generate a random string of specified length using the charset
const generateRandomString = (length: number) => {
  return Array.from({ length }, () => CHARSET[Math.floor(Math.random() * CHARSET.length)]).join("");
};

// Generate a short, readable token
const generateToken = () => {
  // Get current timestamp in milliseconds and take last 4 digits
  const timestamp = Date.now() % 10000;
  // Convert to base62 (will be 2-3 chars)
  let timeStr = "";
  let num = timestamp;
  do {
    timeStr = CHARSET[num % 62] + timeStr;
    num = Math.floor(num / 62);
  } while (num > 0);

  // Pad with random characters to make it 8 chars total
  const randomPart = generateRandomString(8 - timeStr.length);
  return timeStr + randomPart;
};

interface SharedPromptRpcRow {
  id: string;
  prompt_id: string;
  share_token: string;
  views: number | null;
  created_at: string;
  created_by: string;
  prompt_title: string | null;
  prompt_description: string | null;
  prompt_system_prompt: string | null;
  prompt_user_prompt: string | null;
  prompt_version: string | null;
  prompt_token_count: number | null;
  prompt_category_id: string | null;
}

export const createShareLink = async (promptId: string, userId: string) => {
  try {
    console.log("Starting createShareLink for promptId:", promptId);

    // Check if a share record already exists
    const { data: existingShare, error: existingError } = await supabase.from("prompt_shares").select().eq("prompt_id", promptId).single();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error checking existing share:", existingError);
      throw existingError;
    }

    if (existingShare) {
      console.log("Found existing share:", existingShare);
      return {
        shareToken: existingShare.share_token,
        shareUrl: `${window.location.origin}/share/${existingShare.share_token}`,
      };
    }

    console.log("No existing share found, generating new token");
    const shareToken = generateToken();

    console.log("Generated token:", shareToken);

    // Create share record
    const { data: newShare, error: insertError } = await supabase
      .from("prompt_shares")
      .insert({
        id: uuidv4(),
        prompt_id: promptId,
        share_token: shareToken,
        views: 0,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating share record:", insertError);
      throw insertError;
    }

    console.log("Created new share:", newShare);
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    console.log("Share URL:", shareUrl);

    return {
      shareToken,
      shareUrl,
    };
  } catch (error) {
    console.error("Error creating share link:", error);
    throw error;
  }
};

export const getSharedPrompt = async (shareToken: string) => {
  try {
    const { data, error } = await supabase.rpc("get_shared_prompt_by_token", { p_share_token: shareToken });

    if (error) {
      console.error("[getSharedPrompt] Error fetching shared prompt:", error);
      throw error;
    }

    const rows = Array.isArray(data) ? (data as SharedPromptRpcRow[]) : data ? ([data] as SharedPromptRpcRow[]) : [];
    const sharedPrompt = rows[0];

    if (!sharedPrompt) {
      throw new Error("Share link not found or has been removed");
    }

    if (!sharedPrompt.prompt_title) {
      throw new Error("The shared prompt has been removed or is no longer accessible");
    }

    const { data: tagData, error: tagError } = await supabase
      .from("prompt_tags")
      .select(
        `
        tag_id,
        tags:tag_id (
          id,
          name
        )
      `
      )
      .eq("prompt_id", sharedPrompt.prompt_id);

    if (tagError) {
      console.error("[getSharedPrompt] Error fetching tags:", tagError);
    }

    return {
      id: sharedPrompt.id,
      prompt_id: sharedPrompt.prompt_id,
      share_token: sharedPrompt.share_token,
      views: sharedPrompt.views ?? 0,
      created_at: sharedPrompt.created_at,
      created_by: sharedPrompt.created_by,
      prompts: {
        id: sharedPrompt.prompt_id,
        title: sharedPrompt.prompt_title,
        description: sharedPrompt.prompt_description,
        system_prompt: sharedPrompt.prompt_system_prompt,
        user_prompt: sharedPrompt.prompt_user_prompt,
        version: sharedPrompt.prompt_version,
        token_count: sharedPrompt.prompt_token_count ?? 0,
        category_id: sharedPrompt.prompt_category_id,
        prompt_tags: tagData || [],
      },
    };
  } catch (error) {
    console.error("[getSharedPrompt] Error:", error);
    throw error;
  }
};

export const saveSharedPrompt = async (promptData: any, userId: string) => {
  try {
    const { id, created_at, updated_at, ...promptToSave } = promptData;

    // Create a new prompt for the user
    const { data: newPrompt, error } = await supabase
      .from("prompts")
      .insert({
        ...promptToSave,
        id: uuidv4(),
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return newPrompt;
  } catch (error) {
    console.error("Error saving shared prompt:", error);
    throw error;
  }
};
