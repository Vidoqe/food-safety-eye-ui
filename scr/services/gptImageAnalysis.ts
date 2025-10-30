// scr/services/gptImageAnalysis.ts
export type AnalyzeParams = {
  image?: string; // data URL (e.g. "data:image/jpeg;base64,...")
  ingredients?: string; // plain text
  barcode?: string; // e.g. "4712345678901"
  lang?: "zh" | "en"; // UI language
};

type ResultRow = {
  name: string;
  riskLevel: "healthy" | "low" | "moderate" | "harmful" | "unknown";
  childSafe: boolean;
  badge?: "green" | "yellow" | "red" | "gray";
  reason?: string;
  taiwanRegulation?: string;
};

export type AnalyzeResult = {
  ok: boolean;
  message?: string;
  overallResult?: "Low" | "Moderate" | "High" | "Unknown";
  childSafeOverall: boolean;
  table?: ResultRow[];
  used?: { hasImage: boolean; hasIngredients: boolean; hasBarcode: boolean };
  raw?: { ingredients?: string; barcode?: string };
};

const EDGE_URL =
  import.meta.env.VITE_SUPABASE_EDGE_URL ||
  "https://hqgzhlugkytionynror.supabase.co/functions/v1/analyze-product-image";
const EDGE_SECRET = import.meta.env.VITE_EDGE_SHARED_SECRET || "foodsafetysecret456";
console.log("[CFG] EDGE_URL =", EDGE_URL);
console.log("[CFG] EDGE_SECRET set?", Boolean(EDGE_SECRET));
console.log("[CFG] EDGE_URL:", import.meta.env.VITE_SUPABASE_EDGE_URL);
console.log("[CFG] EDGE_SECRET:", import.meta.env.VITE_EDGE_SHARED_SECRET);
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000
) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function AnalyzeProduct(params: AnalyzeParams): Promise<AnalyzeResult> {
  if (!EDGE_URL) throw new Error("VITE_SUPABASE_EDGE_URL is not set");

  const body = {
    image: params.image ?? "",
    ingredients: params.ingredients ?? "",
    barcode: params.barcode ?? "",
    lang: params.lang ?? "zh",
  };

  const res = await fetchWithTimeout(EDGE_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-shared-secret": EDGE_SECRET, // updated header
  },
  body: JSON.stringify(body),
});

// handle response text
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

  try {
    return JSON.parse(text);
  } catch {
    console.error("[AnalyzeProduct] invalid JSON:", text);
    throw new Error("Invalid JSON from edge");
  }
}
