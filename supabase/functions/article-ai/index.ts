import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArticleAIRequest {
  action: "summarize" | "keywords" | "tags" | "suggestions";
  content: string;
  title?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client to get the API key from settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated and is admin/editor
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin or editor
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["admin", "editor"].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Only admins and editors can use AI features" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Gemini API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("gemini_api_key")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = settings?.gemini_api_key;
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured. Please add it in Settings → AI." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, content, title } = await req.json() as ArticleAIRequest;

    if (!content || content.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Content is too short for AI processing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prompt = "";
    let maxTokens = 256;

    switch (action) {
      case "summarize":
        prompt = `You are a Bengali news editor. Create a concise summary (সংক্ষিপ্ত বিবরণ) of the following article in Bengali. The summary MUST be exactly 2 lines and 40-50 words. Do not exceed this limit. Just provide the summary text, no labels or prefixes.

Article Title: ${title || ""}
Article Content: ${content}

Summary in Bengali (2 lines, 40-50 words):`;
        maxTokens = 150;
        break;

      case "keywords":
        prompt = `You are a Bengali SEO expert. Extract 5-8 SEO keywords from the following article. Keywords should be in Bengali and relevant for search engines. Return ONLY a JSON array of strings, no explanation.

Article Title: ${title || ""}
Article Content: ${content}

Return format: ["keyword1", "keyword2", ...]`;
        maxTokens = 200;
        break;

      case "tags":
        prompt = `You are a Bengali news categorization expert. Generate 3-6 relevant tags for the following article. Tags should be in Bengali, short (1-3 words), and descriptive. Return ONLY a JSON array of strings, no explanation.

Article Title: ${title || ""}
Article Content: ${content}

Return format: ["tag1", "tag2", ...]`;
        maxTokens = 150;
        break;

      case "suggestions":
        prompt = `You are a creative Bengali news editor. Based on the following article, suggest 3 related article ideas that could be written as follow-up stories. Return ONLY a JSON array of objects with "title" and "description" fields in Bengali, no explanation.

Article Title: ${title || ""}
Article Content: ${content}

Return format: [{"title": "...", "description": "..."}]`;
        maxTokens = 500;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      
      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid Gemini API key. Please check your API key in Settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Gemini API quota exceeded. Please wait a few seconds and try again, or upgrade your API plan." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate content with AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse result based on action
    let result: any;
    
    if (action === "summarize") {
      result = { summary: generatedText.trim() };
    } else {
      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (handle potential markdown code blocks)
        let jsonStr = generatedText.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "");
        }
        result = { data: JSON.parse(jsonStr.trim()) };
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Text:", generatedText);
        // Return the raw text if JSON parsing fails
        result = { data: generatedText.trim() };
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Article AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});