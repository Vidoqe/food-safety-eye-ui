import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "npm:openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});
const SHARED_SECRET = Deno.env.get("SHARED_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-shared-secret",
};

// --- Helper: format response ---
function makeResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// --- Risk keywords for badges ---
const BADGE_RULES = [
  { keyword: "E102", name: "Tartrazine", risk: "High", child: true, badge: "Red", taiwan: "Restricted" },
  { keyword: "E110", name: "Sunset Yellow", risk: "High", child: true, badge: "Red", taiwan: "Restricted" },
  { keyword: "E621", name: "MSG", risk: "Moderate", child: true, badge: "Yellow", taiwan: "Limited use" },
  { keyword: "E951", name: "Aspartame", risk: "High", child: true, badge: "Red", taiwan: "Restricted" },
  { keyword: "E955", name: "Sucralose", risk: "Moderate", child: true, badge: "Yellow", taiwan: "Limited use" },
  { keyword: "E330", name: "Citric acid", risk: "Low", child: false, badge: "Green", taiwan: "Safe" },
  { keyword: "sugar", name: "Sugar", risk: "Moderate", child: true, badge: "Yellow", taiwan: "Safe" },
  { keyword: "salt", name: "Salt", risk: "Low", child: false, badge: "Green", taiwan: "Safe" },
  { keyword: "water", name: "Water", risk: "Low", child: false, badge: "Green", taiwan: "Safe" },
];

function analyzeIngredients(text: string) {
  const lower = text.toLowerCase();
  const table = [];

  for (const rule of BADGE_RULES) {
    if (lower.includes(rule.keyword.toLowerCase()) || lower.includes(rule.name.toLowerCase())) {
      table.push({
        ingredient: rule.name,
        riskLevel: rule.risk,
        childRisk: rule.child,
        badge: rule.badge,
        taiwanFDA: rule.taiwan,
      });
    }
  }

  if (table.length === 0) {
    return {
      ok: false,
      message: "No known additives detected. Ingredients appear safe.",
      overallResult: "Low",
      childSafeOverall: true,
      table: [],
    };
  }

  const hasHigh = table.some((i) => i.riskLevel === "High");
  const hasModerate = table.some((i) => i.riskLevel === "Moderate");

  return {
    ok: true,
    message: "Ingredients assessed.",
    overallResult: hasHigh ? "High" : hasModerate ? "Moderate" : "Low",
    childSafeOverall: !hasHigh,
    table,
  };
}

// --- Main function ---
serve(async (req) => {
  if (req.method === "OPTIONS") return makeResponse("ok");

  try {
    const body = await req.json();
    const { ingredients, secret } = body;

    if (secret !== SHARED_SECRET) {
      return makeResponse({ error: "Unauthorized" }, 401);
    }

    if (!ingredients) {
      return makeResponse({ error: "No ingredients provided" }, 400);
    }

    const result = analyzeIngredients(ingredients);
    return makeResponse(result);
  } catch (err) {
    console.error("Error:", err);
    return makeResponse({ error: "Processing failed", details: String(err) }, 500);
  }
});
