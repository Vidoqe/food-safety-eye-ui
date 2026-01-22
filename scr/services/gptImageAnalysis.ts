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
    overrideText?: string,
    overrideBarcode?: string
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
          imageBase64,
          overrideText,
          overrideBarcode,
          user_id: "96882bc1-7a4f-4123-9314-058368d989f4",
        }),
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();

    // API contract: { ok: true, result: {...} }
    return data.result as GPTAnalysisResult;
  }
}
