// scr/services/gptImageAnalysis.ts

export type GPTAnalysisResult = {
  verdict: "healthy" | "moderate" | "harmful";
  ingredients: Array<{
    name: string;
    name_en: string;
    name_zh: string;
    status: "healthy" | "low" | "moderate" | "harmful";
    badge: string;
    childSafe: boolean;
    reason?: string;
    matchedKey?: string;
  }>;
  tips: string[];
  summary?: string;
};

export default class GPTImageAnalysisService {
  static async analyzeProduct(
  imageBase64: string,
  ingredients?: string
): Promise<GPTAnalysisResult> {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!anonKey) {
      throw new Error("Missing VITE_SUPABASE_ANON_KEY");
    }

    const res = await fetch(
      "https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT: anon key only (never service role on frontend)
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
      body: JSON.stringify({
  imageBase64:
  typeof imageBase64 === "string"
    ? imageBase64
    : (imageBase64 as any)?.image ?? "",
  user_id: "96882bc1-7a4f-4123-9314-058368d989f4",
}),
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

  const data = await res.json();
const backend = data?.result ?? {};

// backend arrays
const rawIngredients = Array.isArray(backend.ingredients) ? backend.ingredients : [];
const rawAllergens = Array.isArray(backend.potential_allergens) ? backend.potential_allergens : [];
const rawAdditives = Array.isArray(backend.additives) ? backend.additives : [];

const norm = (v: any) => String(v ?? "").trim();

// ---- Allergens blob (robust matching) ----
const allergenText = rawAllergens.map((a: any) => norm(a)).join(" ").toLowerCase();
const allergenNames = rawAllergens
  .map((s: any) => norm(s).replace(/\s*\(.*?\)\s*/g, ""))
  .filter(Boolean);

// ---- Additives list ----
const additiveNames = rawAdditives
  .map((a: any) => (typeof a === "string" ? norm(a) : norm(a?.name)))
  .filter(Boolean);

// ---- Map ingredients into YOUR UI contract ----
const mapped = rawIngredients.map((x: any) => {
  const name_zh = norm(x?.name);
  const notes = norm(x?.notes || x?.description || "");
  const category = norm(x?.category || "");
  const chem = norm(x?.chemical_name || "");
  const func = norm(x?.function || category || "");

  const isAllergen =
    (!!name_zh && allergenText.includes(name_zh.toLowerCase())) ||
    allergenNames.some((a) => a === name_zh || name_zh.includes(a) || a.includes(name_zh)) ||
    (/麵粉|小麥|wheat/i.test(name_zh) && /wheat|小麥|麵粉/i.test(allergenText)) ||
    (/魚|fish/i.test(name_zh) && /fish|魚/i.test(allergenText));

  const isAdditive =
    !!chem ||
    !!func ||
    (!!name_zh && additiveNames.some((a) => a === name_zh));

  const status: "healthy" | "low" | "moderate" | "harmful" =
     isAdditive ? "moderate" : "low";

  const badge = isAllergen ? "Allergen" : isAdditive ? "Additive" : "";

  // Provide multiple child fields (because your UI might use any of them)
  const childSafe = !isAllergen;
  const childRisk = childSafe ? "Safe" : "Avoid";

  // Provide multiple Taiwan regulation fields (UI might use any of them)
  const taiwanText = "No specific restriction";

  return {
    name: name_zh, // UI currently shows this
    name_zh: name_zh,
    name_en: notes || func || "", // gives English column something to show
    status, // UI uses this for Risk Level
    badge, // UI badge column
    childSafe,
    childRisk,
    child_risk: childRisk,

    taiwanFdaRegulation: taiwanText,
    taiwan_fda_regulation: taiwanText,
    taiwanFDARegulation: taiwanText,

    reason: notes || func || "",
    matchedKey: "",
  };
});

// verdict based on worst item
const verdict: "healthy" | "moderate" | "harmful" =
  mapped.some((i) => i.status === "harmful")
    ? "harmful"
    : mapped.some((i) => i.status === "moderate")
    ? "moderate"
    : "healthy";

return {
  verdict,
  ingredients: mapped,
  tips: backend.notes ? [String(backend.notes)] : [],
  summary: backend.notes ? String(backend.notes) : "",
} as GPTAnalysisResult;




  }
}
