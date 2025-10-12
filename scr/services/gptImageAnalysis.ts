/**
 * scr/services/gptImageAnalysis.ts — Food Safety Eye (UI)
 * Calls Supabase Edge Function `analyze-product-image`
 * Auth uses the shared secret: foodsafetysecret123
 * Logs enough info to debug in DevTools.
 */

console.log('✅ [UI] gptImageAnalysis loaded');

/* ====== CONFIG (update only the ANON_KEY if needed) ====== */
const SUPABASE_URL =
  'https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image';

// Supabase ANON KEY (not your OpenAI key). If you already
// have this set correctly, keep your existing one.
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3IakuBqddM';

// Must match the secret your Edge Function checks
const BEARER_TOKEN = 'foodsafetysecret123';

/* ============== Public types (lightweight) ============== */
export type Risk = 'healthy' | 'low' | 'moderate' | 'harmful' | 'unknown';

export interface IngredientRow {
  name: string;
  riskLevel: Risk;
  childSafe?: boolean;
  badge?: 'green' | 'yellow' | 'red' | 'gray';
  reason?: string;
}

export interface AnalysisResult {
  verdict: Risk;
  ingredients: IngredientRow[];
  tips?: string;
  summary?: string;
}

export interface AnalysisResponse {
  ok: boolean;
  result?: AnalysisResult;
  error?: string;
}

/* ================== Helpers (UI only) =================== */
export async function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    (input as any).capture = 'environment';

    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return reject(new Error('No file selected'));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    };

    input.onerror = () => reject(new Error('Camera/file picker failed'));
    input.click();
  });
}

/* Fetch with timeout + DEBUG logs */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  console.log('[DEBUG] calling fetch URL:', url);
  console.log('[DEBUG] request headers:', init?.headers);

  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    const ms = Math.round(performance.now() - started);
    console.log('[DEBUG] fetch response status:', resp.status, `(${ms}ms)`);
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

/* ====================== MAIN CALL ======================= */
export async function analyzeProduct(params: {
  imageBase64?: string;
  barcode?: string;
  ingredients?: string;
  lang?: 'en' | 'zh';
}): Promise<AnalysisResponse> {
  const { imageBase64, barcode, ingredients, lang = 'zh' } = params;

  console.log('[UI] analyzeProduct() → payload overview:', {
    hasImage: !!imageBase64,
    imageLen: imageBase64?.length ?? 0,
    barcode,
    ingredientsLen: ingredients?.length ?? 0,
    lang,
  });

  if (!imageBase64 && !barcode && !ingredients) {
    return { ok: false, error: 'Please provide a barcode, ingredients, or image' };
  }

  try {
    const response = await fetchWithTimeout(
      SUPABASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // This must match the Edge Function check:
          // const authHeader = req.headers.get('authorization');
          // 'Bearer foodsafetysecret123'
          Authorization: `Bearer ${foodsafetysecret123}`,
          // Required by Supabase Functions Gateway
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          image: imageBase64,
          barcode,
          ingredients,
          lang,
        }),
      },
      35000
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('❌ [UI] Edge Function error:', response.status, text?.slice(0, 400));
      return {
        ok: false,
        error: `Edge Function error ${response.status}: ${text?.slice(0, 300)}`,
      };
    }

    const result = (await response.json()) as AnalysisResult | any;
    console.log('✅ [UI] Edge Function JSON received:', result);

    // Normalize shape so Result screen never crashes
    if (!result || !result.verdict) {
      return { ok: false, error: 'Malformed response from server' };
    }

    return { ok: true, result };
  } catch (err: any) {
    console.error('❌ [UI] analyzeProduct threw:', err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
}

/* ================ default-style export ================== */
export const GPTImageAnalysisService = {
  captureImageFromCamera,
  analyzeProduct,
};
