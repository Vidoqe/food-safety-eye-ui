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

// API contract: { ok: true, result: { ... } }
const backend = data?.result ?? {};

const rawIngredients = Array.isArray(backend.ingredients) ? backend.ingredients : [];
const rawAllergens = Array.isArray(backend.potential_allergens) ? backend.potential_allergens : [];
const rawAdditives = Array.isArray(backend.additives) ? backend.additives : [];

const norm = (v: any) => String(v ?? "").trim();

// "魚漿 (contains fish...)" -> "魚漿"
const allergenNames = rawAllergens
  .map((s: any) => norm(s).replace(/\s*\(.*?\)\s*/g, ""))
  .filter(Boolean);

const additiveNames = rawAdditives
  .map((a: any) => (typeof a === "string" ? norm(a) : norm(a?.name)))
  .filter(Boolean);

const mapped = rawIngredients.map((x: any) => {
  const name_zh = norm(x?.name);
  const notes = norm(x?.notes);
  const chem = norm(x?.chemical_name);
  const func = norm(x?.function);

  const isAllergen =
    !!name_zh &&
    allergenNames.some((a) => a === name_zh || name_zh.includes(a) || a.includes(name_zh));

  const isAdditive =
    !!chem ||
    !!func ||
    (!!name_zh && additiveNames.some((a) => a === name_zh));

  // IMPORTANT: UI expects "low" not "healthy"
  const status: "low" | "moderate" | "harmful" =
    isAllergen ? "harmful" : isAdditive ? "moderate" : "low";

  const badge =
    isAllergen ? "Allergen" : isAdditive ? "Additive" : "";

  // Make Child Risk not "Unknown"
  const childSafe = !isAllergen;

  return {
    name: name_zh || notes || chem || func || "",
    name_en: notes || chem || func || "",
    name_zh: name_zh || "",
    status,
    badge,
    childSafe,
    reason: notes || func || chem || "",
    matchedKey: "",
  };
});

// Verdict used for the big “Overall Result”
const verdict: "healthy" | "moderate" | "harmful" =
  mapped.some((i) => i.status === "harmful")
    ? "harmful"
    : mapped.some((i) => i.status === "moderate")
    ? "moderate"
    : "healthy";

const tips: string[] = [];
if (backend.notes) tips.push(String(backend.notes));
if (allergenNames.length) tips.push(`Potential allergens: ${allergenNames.join(", ")}`);

const result: GPTAnalysisResult = {
  verdict,
  ingredients: mapped,
  tips,
  summary: backend.notes ? String(backend.notes) : "",
};

return result;



  }
}
