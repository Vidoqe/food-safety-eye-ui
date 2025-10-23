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

  const res = await fetchWithTimeout(
    EDGE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(EDGE_SECRET ? { Authorization: `Bearer ${EDGE_SECRET}` } : {}),
      },
      body: JSON.stringify(body),
    },
    30000
  );

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // leave empty if not JSON
  }

  if (!res.ok) {
    return {
      ok: false,
      message: `Edge returned ${res.status}`,
      ...(typeof json === "object" ? json : { raw: { errorText: text } }),
    };
  }

  return (json as AnalyzeResult) ?? { ok: true, message: "No payload" };
}
