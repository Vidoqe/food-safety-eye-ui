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

const rawIngredients = Array.isArray(backend.ingredients) ? backend.ingredients : [];
const rawAllergens = Array.isArray(backend.potential_allergens) ? backend.potential_allergens : [];
const rawAdditives = Array.isArray(backend.additives) ? backend.additives : [];

const norm = (v: any) => String(v ?? "").trim();

// Make one big allergen text blob for “includes” checks
const allergenText = rawAllergens.map((a: any) => norm(a)).join(" ").toLowerCase();

// Also keep cleaned allergen names list
const allergenNames = rawAllergens
  .map((s: any) => norm(s).replace(/\s*\(.*?\)\s*/g, "")) // remove (wheat) etc
  .filter(Boolean);

const additiveNames = rawAdditives
  .map((a: any) => (typeof a === "string" ? norm(a) : norm(a?.name)))
  .filter(Boolean);

const mapped = rawIngredients.map((x: any) => {
  const name_zh = norm(x?.name);
  const notes = norm(x?.notes);
  const chem = norm(x?.chemical_name);
  const func = norm(x?.function);

  // ✅ Robust allergen detection (works even if formatting differs)
  const isAllergen =
    (!!name_zh && allergenText.includes(name_zh.toLowerCase())) ||
    allergenNames.some((a) => a === name_zh || name_zh.includes(a) || a.includes(name_zh)) ||
    // fallback keyword matches (wheat/fish) if backend only gave English
    (/麵粉|小麥|wheat/i.test(name_zh) && /wheat|小麥|麵粉/i.test(allergenText)) ||
    (/魚|fish/i.test(name_zh) && /fish|魚/i.test(allergenText));

  const isAdditive =
    !!chem ||
    !!func ||
    (!!name_zh && additiveNames.some((a) => a === name_zh));

  const status: "low" | "moderate" | "harmful" =
    isAllergen ? "harmful" : isAdditive ? "moderate" : "low";

  const badge = isAllergen ? "Allergen" : isAdditive ? "Additive" : "";

  // ✅ Give the UI multiple child fields so it doesn’t show Unknown
  const childSafe = !isAllergen;
  const childRisk = childSafe ? "Safe" : "Avoid";

  return {
    name: name_zh || "",
    name_en: notes || chem || func || "",
    name_zh: name_zh || "",
    status,
    badge,

    // try all common field names the UI might be using:
    childSafe,
    childRisk,
    child_risk: childRisk,

    reason: notes || func || chem || "",
    matchedKey: "",
  };
});

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
