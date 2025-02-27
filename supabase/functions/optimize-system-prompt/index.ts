import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
    }

    // Parse request body
    const { systemPrompt } = await req.json();

    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "System prompt is required" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: Deno.env.get("DEEPSEEK_API_KEY") ?? "",
    });

    // Create the optimization prompt
    const optimizationPrompt = `
You are an expert in prompt engineering. Your task is to optimize the following system prompt to make it more effective, clear, and concise.

Follow these best practices:
1. Remove redundant or unnecessary information
2. Improve clarity and specificity
3. Ensure the prompt is well-structured with clear instructions
4. Add appropriate constraints and guidelines
5. Maintain the original intent and purpose
6. Optimize for the model's understanding
7. IMPORTANT: Preserve the original language of the prompt (e.g., if it's in Chinese, keep it in Chinese; if it's in English, keep it in English)
8. Maintain any language-specific instructions or cultural context

Here is the system prompt to optimize:

${systemPrompt}

Provide ONLY the optimized version of the system prompt, with no additional explanations or comments.
`;

    // Call the AI model to optimize the prompt
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant specialized in prompt engineering and optimization." },
        { role: "user", content: optimizationPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const optimizedPrompt = completion.choices[0].message.content;

    // Return the optimized prompt
    return new Response(JSON.stringify({ optimizedPrompt }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
