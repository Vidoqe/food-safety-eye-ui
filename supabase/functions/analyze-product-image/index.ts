import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "npm:openai";
// -------- System Prompt Function --------
// -------- System Prompt Function --------
function systemPrompt() {
  return `
You are a Taiwan food-safety assistant.

Your job is to evaluate ingredients and give Taiwan FDA–based risk analysis.
For each ingredient, output:
- name
- riskLevel: "healthy" | "moderate" | "harmful"
- childRisk: true | false | "unknown"
- badge: "green" | "yellow" | "red" | "gray"
- taiwanFDA: summary of its legal status (Allowed, Allowed with limits, or Prohibited)
- comment: short explanation of its effect and reason for rating
- analysis: overall paragraph combining health, child safety, and regulatory context
`;
}
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
});
const SHARED_SECRET = Deno.env.get("VITE_FEDGE_SHARED_SECRET") ?? "foodsafetysecret456";

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

    // --- Extract Authorization header or x-shared-secret ---
const authHeader = req.headers.get("authorization") || "";
const token =
  authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : req.headers.get("x-shared-secret") || "";

// --- Validate ---
if (token !== SHARED_SECRET) {
  return makeResponse({ error: "Unauthorized", message: "Invalid shared secret" }, 401);
}

    if (!ingredients) {
      return makeResponse({ error: "No ingredients provided" }, 400);
    }
async function analyzeIngredients(ingredients) {
  const prompt = systemPrompt();
  const aiInput = `Ingredients: ${ingredients}`;

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: aiInput },
  ];

  const ai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") ?? "" });
  const chat = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.3,
  });

  try {
    return JSON.parse(chat.choices[0].message.content);
  } catch {
    return {
      ok: false,
      message: "AI failed to produce valid JSON.",
    };
  }
}

    const result = analyzeIngredients(ingredients);
    return makeResponse(result);
  } catch (err) {
    console.error("Error:", err);
    return makeResponse({ error: "Processing failed", details: String(err) }, 500);
  }
});
