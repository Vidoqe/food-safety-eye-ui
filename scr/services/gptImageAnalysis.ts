// UNIQUE MARKER – should print on page load if the file is bundled
console.log('BUNDLE_MARKER_2025-10-09 :: gptImageAnalysis loaded');
// src/services/gptImageAnalysis.ts
// Service for capturing images and sending them for analysis.
// Adds client-side compression, request timeout, and detailed DEBUG logs.

export type Risk = 'healthy' | 'low' | 'moderate' | 'harmful' | string;

export interface IngredientRow {
  name: string;       // raw string from model or OCR
  name_en?: string;
  name_zh?: string;
  status?: Risk;
  badge?: string;
  childSafe?: boolean;
  reason?: string;
  matchedKey?: string;
  taiwanRegulation?: string;
  chinese?: string; // compat
}

export interface AnalysisResult {
  verdict: Risk;
  ingredients: IngredientRow[];
  tips?: string[];
  summary?: string;
}

export interface AnalysisResponse {
  ok: boolean;
  result?: AnalysisResult;
  error?: string;
}

// ---------- small helpers ----------

/** Read a File to data:URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Compress a data:URL image down to maxSide px and JPEG quality */
async function compressDataUrl(
  dataUrl: string,
  maxSide = 1400,
  quality = 0.75
): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image decode failed'));
    img.src = dataUrl;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outw = Math.round(width * scale);
  const outh = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outw;
  canvas.height = outh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, outw, outh);

  const out = canvas.toDataURL('image/jpeg', quality);
  return out;
}

/** Open camera/file picker; return base64 dataURL of (compressed) image */
export async function captureImageFromCamera(): Promise<string> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  (input as any).capture = 'environment'; // prefer back camera on mobile

  // Chrome has showPicker; fallback otherwise
  try {
    if ((input as any).showPicker) (input as any).showPicker();
    else input.click();
  } catch {
    input.click();
  }

  return new Promise<string>((resolve, reject) => {
    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        if (!file) return reject(new Error('No file selected'));
        const raw = await fileToDataUrl(file);
        const compressed = await compressDataUrl(raw, 1400, 0.75);

        console.log('📸 captured image dataURL length:', compressed.length);
        console.log('📸 first 120 chars:', compressed.substring(0, 120));

        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    input.onerror = () => reject(new Error('Camera/file picker failed'));
  });
}

/** Fetch with timeout and DEBUG logs */
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

// ================= CONFIG – put your actual values here ==================

const SUPABASE_URL =
  'https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image';
// ^ keep your real URL here

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3IakuBqddM';
// ^ public anon key is required by Supabase Functions Gateway
//   (do NOT put your OpenAI key here; that stays only on the Edge Function)

// ================= MAIN CALL =================

/**
 * Analyze a product (image + optional barcode/ingredients + lang) via Supabase.
 * Returns parsed JSON for the ResultScreen.
 */
export async function analyzeProduct(params: {
  imageBase64: string;
  barcode?: string;
  ingredients?: string;
  lang?: 'en' | 'zh';
}): Promise<AnalysisResponse> {
  const { imageBase64, barcode, ingredients, lang = 'en' } = params;

  // quick sanity logs (redact long body)
  console.log('[DEBUG] analyzeProduct: payload overview ->', {
    imgLen: imageBase64?.length,
    barcode,
    ingredientsLen: ingredients?.length ?? 0,
    lang,
  });

  try {
    const response = await fetchWithTimeout(
      SUPABASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Your Function checks this shared secret only on the server (OK).
          Authorization: 'Bearer foodSafetySecret123', // or whatever shared secret you verify
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
      console.error('❌ Edge Function error:', response.status, text);
      return {
        ok: false,
        error: `Server error ${response.status}${
          text ? `: ${text.slice(0, 300)}` : ''
        }`,
      };
    }

    const result = (await response.json()) as AnalysisResult;
    console.log('✅ Edge Function JSON received:', result);

    // minimal normalization so UI never crashes
    if (!result || !result.verdict) {
      return { ok: false, error: 'Malformed response from server' };
    }
    result.ingredients = Array.isArray(result.ingredients)
      ? result.ingredients
      : [];

    return { ok: true, result };
  } catch (err: any) {
    console.error('🚨 analyzeProduct threw:', err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}

// ---------- convenient default export used by screens ----------
export const GPTImageAnalysisService = {
  captureImageFromCamera,
  analyzeProduct,
};
