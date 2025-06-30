import { supabase } from "./supabase";

export async function generateApiToken(userId: string, name: string): Promise<{ token: string; error: string | null }> {
  try {
    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from("api_tokens")
      .insert([
        {
          name,
          user_id: userId,
          token,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { token: "", error: error.message };
    }

    return { token, error: null };
  } catch (error) {
    return { token: "", error: "Failed to generate token" };
  }
}

export async function validateApiToken(token: string): Promise<{ userId: string | null; error: string | null }> {
  if (!token) {
    return { userId: null, error: "Missing authorization token" };
  }

  // Extract the actual token if it's prefixed with 'Bearer '
  const tokenValue = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

  if (!tokenValue) {
    return { userId: null, error: "Invalid token format" };
  }

  try {
    const { data, error } = await supabase.from("api_tokens").select("user_id, expires_at, token").eq("token", tokenValue).single();

    if (error) {
      if (error.code === "PGRST116") {
        return { userId: null, error: "Invalid API token" };
      }
      return { userId: null, error: "Failed to validate token" };
    }

    if (!data) {
      return { userId: null, error: "Invalid API token" };
    }

    // Check expiration if expires_at is set
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { userId: null, error: "API token expired" };
    }

    // Comment out last_used_at update to avoid circular requests
    // await supabase.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", tokenValue);

    return { userId: data.user_id, error: null };
  } catch (err) {
    return { userId: null, error: "Internal server error during token validation" };
  }
}
