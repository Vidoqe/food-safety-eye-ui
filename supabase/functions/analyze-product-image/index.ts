// --- Imports ---
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "npm:openai";

// --- Clients / secrets ---
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});
const SHARED_SECRET = Deno.env.get("SHARED_SECRET") ?? "";

// --- CORS ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shared-secret",
};

// --- System Prompt ---
function systemPrompt(lang: string) {
  const lines = [];
  lines.push(
    lang === "zh"
      ? "你是一個台灣食品安全助手，請只輸出 JSON。"
      : "You are a Taiwan food-safety assistant. Output ONLY valid JSON."
  );
  lines.push("Required JSON shape:");
  lines.push("{");
  lines.push('"ok": boolean,');
  lines.push('"message": string,');
  lines.push('"overallResult": "Low" | "Moderate" | "High" | "Unknown",');
  lines.push('"childSafeOverall": boolean,');
  lines.push('"table": [');
  lines.push(
    '{ "ingredient": string, "riskLevel": string, "childRisk": boolean, "badge": string, "taiwanFDA": string }'
  );
  lines.push("]");
  lines.push("}");
  return lines.join("\n");
}

// --- User Prompt from Ingredients ---
function userPromptFromIngredients(ingredients: string, lang: string) {
  return lang === "zh"
    ? `分析以下食品成分，根據台灣食品安全標準：${ingredients}`
    : `Analyze the following ingredients for food-safety risk according to Taiwan FDA rules: ${ingredients}`;
}

// --- Main Function ---
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ingredients, image, lang = "en", secret } = body;

    if (secret !== SHARED_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid shared secret" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const hasIngredients = !!ingredients && ingredients.trim().length > 0;
    const hasImage = !!image;

    console.log("[Edge] Incoming:", { hasIngredients, hasImage, lang });

    // Require at least one input
    if (!hasIngredients && !hasImage) {
      return new Response(
        JSON.stringify({ error: "No ingredients or image provided" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Only text-based ingredient analysis for now
    const messages = [
      { role: "system", content: systemPrompt(lang) },
      { role: "user", content: userPromptFromIngredients(ingredients, lang) },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiText = completion.choices?.[0]?.message?.content ?? "";
    let aiResult;
    try {
      aiResult = JSON.parse(aiText);
    } catch (e) {
      console.error("JSON parse error:", aiText);
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON", raw: aiText }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(aiResult), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("AI error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "AI evaluation failed",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
