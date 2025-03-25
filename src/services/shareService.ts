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
    // Generate token directly here to ensure it works
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let shareToken = "";
    for (let i = 0; i < 8; i++) {
      shareToken += characters.charAt(Math.floor(Math.random() * characters.length));
    }

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
    console.log("[getSharedPrompt] Called with token:", shareToken);

    // First, get just the share record without relationships
    const { data: shareRecord, error: shareError } = await supabase.from("prompt_shares").select("*").eq("share_token", shareToken).single();

    if (shareError) {
      console.error("[getSharedPrompt] Error fetching share record:", shareError);
      throw shareError;
    }

    console.log("[getSharedPrompt] Retrieved share record:", JSON.stringify(shareRecord, null, 2));

    // Now fetch the prompt separately
    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .select(
        `
        id,
        title,
        description,
        system_prompt,
        user_prompt,
        version,
        token_count,
        category_id
      `
      )
      .eq("id", shareRecord.prompt_id)
      .single();

    if (promptError) {
      console.error("[getSharedPrompt] Error fetching prompt:", promptError);
      throw promptError;
    }

    console.log("[getSharedPrompt] Retrieved prompt data:", JSON.stringify(promptData, null, 2));

    // Fetch tags separately
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
      .eq("prompt_id", shareRecord.prompt_id);

    if (tagError) {
      console.error("[getSharedPrompt] Error fetching tags:", tagError);
      // Don't throw, we can continue without tags
    }

    // Add prompt data and tags to the share record
    shareRecord.prompts = {
      ...promptData,
      prompt_tags: tagData || [],
    };

    // Increment view count
    try {
      const { error: updateError } = await supabase
        .from("prompt_shares")
        .update({ views: (shareRecord.views || 0) + 1 })
        .eq("id", shareRecord.id);

      if (updateError) {
        console.error("[getSharedPrompt] Error updating view count:", updateError);
      }
    } catch (updateError) {
      console.error("[getSharedPrompt] Exception updating view count:", updateError);
    }

    return shareRecord;
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
