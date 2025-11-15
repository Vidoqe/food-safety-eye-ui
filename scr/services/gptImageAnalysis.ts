// scr/services/gptImageAnalysis.ts

export type AnalyzeResult = {
  ingredients: string;
  riskLevel: string;
  childSafe: boolean;
  badge: string;
  comment: string;
  analysis: string;
};

export async function AnalyzeProduct(
  payload: any,
  ac?: AbortController
): Promise<AnalyzeResult | { error: string }> {
  const EDGE_URL = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const SHARED_SECRET = import.meta.env.VITE_EDGE_SHARED_SECRET;

  console.log("[AnalyzeProduct] EDGE_URL from env:", EDGE_URL);

  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shared-secret": SHARED_SECRET ?? "",
      },
      body: JSON.stringify({
        ingredients:
          payload?.ingredients ||
          payload?.text ||
          payload?.input ||
          payload?.ingredians ||
          "",
        barcode: payload?.barcode || "",
      }),
      signal: ac?.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[AnalyzeProduct] Edge HTTP error", res.status, text);
      return { error: `Edge returned ${res.status}` };
    }

    const data = (await res.json()) as AnalyzeResult;
    console.log("[AnalyzeProduct] Edge data:", data);
    return data;
  } catch (err: any) {
    console.error("[AnalyzeProduct] Error calling Edge:", err);
    return { error: err?.message || "Edge call failed" };
  }
}
