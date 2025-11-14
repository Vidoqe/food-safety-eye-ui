// scr/services/gptImageAnalysis.ts

export type AnalyzeResult = {
  ingredients: string;
  riskLevel: string;
  childSafe: boolean;
  badge: string;
  comment: string;
  analysis: string;
};

type AnalyzePayload = {
  ingredients?: string;
  text?: string;
  input?: string;
  ingrediants?: string; // old typo support
  barcode?: string;
};

export async function AnalyzeProduct(
  payload: AnalyzePayload,
  ac?: AbortController
): Promise<AnalyzeResult> {
  const EDGE_URL = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const SHARED_SECRET = import.meta.env.VITE_EDGE_SHARED_SECRET;

  console.log("[AnalyzeProduct] EDGE_URL from env:", EDGE_URL);

  // Build body for Edge function
  const body = {
    ingredients:
      payload.ingredients ??
      payload.text ??
      payload.input ??
      payload.ingrediants ??
      "",
    barcode: payload.barcode ?? "",
  };

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SHARED_SECRET ? { "x-shared-secret": SHARED_SECRET } : {}),
    },
    body: JSON.stringify(body),
    signal: ac?.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[AnalyzeProduct] Edge error", res.status, text);
    throw new Error(`Edge returned ${res.status}`);
  }

  const data = await res.json();
  console.log("[AnalyzeProduct] Edge data:", data);
  return data as AnalyzeResult;
}
