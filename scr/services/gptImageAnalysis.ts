// scr/services/gptImageAnalysis.ts
export type GPTAnalysisResult = {
  verdict: 'healthy' | 'moderate' | 'harmful';
  ingredients: Array<{
    name: string;
    name_en: string;
    name_zh: string;
    status: 'healthy' | 'low' | 'moderate' | 'harmful';
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
    imageBase64?: string,
    overrideText?: string,
    overrideBarcode?: string
  ): Promise<GPTAnalysisResult> {
    const res = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, overrideText, overrideBarcode })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error ${res.status}: ${txt}`);
    }

    const data = await res.json();
    // our API returns { ok, result }
    return data.result as GPTAnalysisResult;
  }
}
