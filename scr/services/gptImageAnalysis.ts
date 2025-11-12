// scr/services/gptImageAnalysis.ts

// ------- Types --------
export type AnalyzeParams = {
  image?: string;        // base64 data URL (optional)
  ingredients?: string;  // plain text ingredients
  barcode?: string;      // barcode numbers as string
  lang?: "zh" | "en";    // UI language
};

type ResultRow = {
  name: string;
  riskLevel: "healthy" | "low" | "moderate" | "harmful" | "unknown";
  childSafe?: boolean;
  badge?: "green" | "yellow" | "red" | "gray";
  reason?: string;
  taiwanRegulation?: string;
};

export type AnalyzeResult = {
  ok: boolean;
  message?: string;
  overallResult?: "Low" | "Moderate" | "High" | "Unknown";
  childSafeOverall?: boolean;
  table?: ResultRow[];

  // debug/meta, optional
  used?: {
    hasImage: boolean;
    hasIngredients: boolean;
    hasBarcode: boolean;
  };
  raw?: {
    ingredients?: string;
    barcode?: string;
  };
};

// ------- Config --------
// IMPORTANT: put your real Supabase edge function URL here:
const EDGE_URL =
  import.meta.env.VITE_SUPABASE_EDGE_URL ||
  "https://YOUR-PROJECT-REF.functions.supabase.co/analyze-product-image";

const EDGE_SECRET =
  import.meta.env.VITE_EDGE_SHARED_SECRET || "foodsafetysecret456";

// timeout wrapper for fetch so UI doesn't hang forever
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000
) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
   return await fetch(url, {
  ...init,
  headers: {
    ...(init.headers || {}),
    "Authorization": `Bearer ${import.meta.env.VITE_EDGE_SHARED_SECRET}`,
    "x-shared-secret": import.meta.env.VITE_EDGE_SHARED_SECRET,
    "Content-Type": "application/json",
  },
  signal: ac.signal,
});
  } finally {
    clearTimeout(t);
  }
}

// ------- Main call --------
export async function AnalyzeProduct(
  params: AnalyzeParams
): Promise<AnalyzeResult> {
  if (!EDGE_URL) {
    throw new Error("VITE_SUPABASE_EDGE_URL is not set");
  }

  const body = {
  image: params.image ?? "",
  ingredients: params.ingredients ?? "",
  ingredientsText: (params as any).ingredientsText ?? "", // 👈 add this line
  barcode: params.barcode ?? "",
  lang: params.lang ?? "zh",
};

const res = await fetchWithTimeout(EDGE_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-shared-secret": EDGE_SECRET,
  },
  body: JSON.stringify(body),
});

  const text = await res.text();

  if (!res.ok) {
    console.error("[AnalyzeProduct] error response:", text);
    throw new Error("Edge function returned error");
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("[AnalyzeProduct] invalid JSON:", text);
    throw new Error("Invalid JSON from edge");
  }
}
