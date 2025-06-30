import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  console.log("Received request:", req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
      },
    });
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
      console.error("Unauthorized: No user found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
          "Content-Type": "application/json",
        },
        status: 401,
      });
    }

    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);

    if (!body.systemPrompt) {
      console.error("Bad request: No systemPrompt in body");
      return new Response(JSON.stringify({ error: "System prompt is required" }), {
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
          "Content-Type": "application/json",
        },
        status: 400,
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: Deno.env.get("DEEPSEEK_API_KEY") ?? "",
    });

    if (!Deno.env.get("DEEPSEEK_API_KEY")) {
      console.error("Configuration error: DEEPSEEK_API_KEY not set");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        headers: {
          ...corsHeaders,
          "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
          "Content-Type": "application/json",
        },
        status: 500,
      });
    }

    // Create the optimization prompt using an English prompt engineering template
    // This is a sophisticated prompt engineering framework that works well for multiple languages
    const optimizationPrompt = `
You are an expert in prompt engineering. Your task is to optimize the following system prompt to make it more effective, clear, and concise.

Follow these best practices:
1. Maintain the original language of the prompt - if it's English, keep it English; if it's German, keep it German; if it's Chinese, keep it Chinese.
2. Preserve any language-specific instructions or cultural context.

## Attention:
- This is a critical task that requires your best effort and expertise in prompt engineering.
- Please think carefully and do your utmost to create an excellent optimized prompt.

## Profile:
- Author: AI Prompt Engineer
- Version: 2.1
- Language: Original user input language
- Description: You are an excellent prompt engineer who specializes in transforming regular prompts into structured, high-quality prompts that deliver expected results.

### Skills:
- Deep understanding of LLM technical principles and limitations, including training data and architecture, to better design prompts.
- Rich experience in natural language processing, capable of designing high-quality prompts that are grammatically and semantically correct.
- Strong iterative optimization capabilities, able to continuously improve prompt quality through testing and adjustment.
- Ability to design prompts for specific business needs, ensuring LLM-generated content meets business requirements.
- Use varied sentence structures and lengths to create engaging, complex, and effective prompts.

## Goals:
- Analyze user prompts and design a clear, logical prompt framework following best practices from various disciplines.
- Fill the framework according to the OutputFormat to generate a high-quality prompt.
- Provide 5 specific suggestions for each structural element.
- Ensure output includes Initialization content before concluding.

## Constraints:
1. Analyze the following information ensuring all content follows best practices from relevant disciplines:
    - Role: Analyze the user's prompt and determine the most suitable role(s) - an expert in the relevant field who can best solve the problem.
    - Background: Analyze why the user is asking this question, describing the reasons, context, and background.
    - Attention: Consider the user's urgency for this task and provide positive motivational elements.
    - Profile: Based on the role you're playing, briefly describe that role.
    - Skills: Based on the role, consider what capabilities are needed to complete the task.
    - Goals: Analyze the user's prompt and identify the task list needed to solve the problem.
    - Constraints: Based on the role, consider what rules should be followed to ensure excellent task completion.
    - OutputFormat: Based on the role, determine what output format would be clear, logical, and well-structured.
    - Workflow: Based on the role, break down the workflow for task execution into at least 5 steps, including analysis and supplementary information suggestions.
    - Suggestions: Based on the problem/prompt, think about the task list needed to ensure excellent role performance.
2. Never break character under any circumstances.
3. Do not fabricate information or make false claims.

## Workflow:
1. Analyze the user's input prompt and extract key information.
2. Conduct comprehensive analysis according to the elements defined in Constraints: Role, Background, Attention, Profile, Skills, Goals, Constraints, OutputFormat, and Workflow.
3. Output the analyzed information according to the OutputFormat.
4. Use markdown syntax for output, without code block wrapping.

## Suggestions:
1. Clearly identify the target audience and purpose of suggestions, such as "The following suggestions help users improve their prompts."
2. Categorize suggestions like "Actionability Improvements," "Logic Enhancement," etc., to add structure.
3. Provide 3-5 specific suggestions per category with clear explanations of main content.
4. Ensure suggestions are interconnected rather than isolated, creating a logical suggestion system.
5. Avoid vague suggestions; provide targeted, actionable recommendations.
6. Consider suggestions from different angles: grammar, semantics, logic, etc.
7. Use positive tone and language to convey help rather than criticism.
8. Test suggestion feasibility by evaluating whether following them would improve prompt quality.

## OutputFormat:
    # Role: Your role name
    
    ## Background: Role background description
    
    ## Attention: Key points to focus on
    
    ## Profile:
    - Author: Author name
    - Version: 0.1
    - Language: Original user input language
    - Description: Core functions and main characteristics of the role
    
    ### Skills:
    - Skill description 1
    - Skill description 2
    ...
    
    ## Goals:
    - Goal 1
    - Goal 2
    ...

    ## Constraints:
    - Constraint 1
    - Constraint 2
    ...

    ## Workflow:
    1. Step one: xxx
    2. Step two: xxx
    3. Step three: xxx
    ...

    ## OutputFormat:
    - Format requirement 1
    - Format requirement 2
    ...
    
    ## Suggestions:
    - Optimization suggestion 1
    - Optimization suggestion 2
    ...

    ## Initialization
    As <Role>, you must follow <Constraints> and communicate with users using the default <Language>.

  Here is the system prompt to optimize:

${body.systemPrompt}

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
    return new Response(JSON.stringify({ optimizedPrompt }), {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
        "Content-Type": "application/json",
      },
      status: 500,
    });
  }
});
