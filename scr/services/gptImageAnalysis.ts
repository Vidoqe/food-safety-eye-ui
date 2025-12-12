// scr/services/gptImageAnalysis.ts
// UI-side helpers + call to Supabase Edge Function
import { detectColorAdditives } from '../utils/detectColorAdditives';
import { COLOR_ADDITIVES } from '../data/colorAdditives';
import { findAdditive } from '../data/additives';
function mapColorAdditiveToIngredientRow(hit) {
  return {
    name: hit.common_name,
    riskLevel: 
      hit.risk_level === 'high' ? 'harmful'
      : hit.risk_level === 'moderate' || hit.risk_level === 'moderate_high' ? 'moderate'
      : 'low',
    childsafe: hit.child_risk === 'avoid' ? false : true,
    badge: hit.badge_color,            // 'red' | 'yellow' | 'green'
    reason: hit.description,
    taiwanRegulation: hit.taiwan_rule,
  };
}
// ---- Types (keep minimal) ----
export type Risk = 'healthy' | 'low' | 'moderate' | 'harmful' | 'unknown';

export interface IngredientRow {
  name: string;
  riskLevel: Risk;
  childSafe?: boolean;
  badge?: 'green' | 'yellow' | 'red' | 'gray';
  reason?: string;
  taiwanRegulation?: string;
}

export interface AnalysisResult {
  overallResult: {
    risk: Risk | 'Low' | 'Moderate' | 'High' | 'Unknown';
    message: string;
    childSafeOverall: boolean;
  };
  table: IngredientRow[];
  used: { hasImage: boolean; hasIngredients: boolean; hasBarcode: boolean };
  raw?: { ingredients?: string; barcode?: string };
}

// ---- Config (these are UI-side values only) ----
const SUPABASE_URL =
  'https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image'; // keep your real URL
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....'; // your Supabase ANON KEY
const SHARED_SECRET = 'foodsafetysecret456'; // must match the Function

// ---- Small helpers ----
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressDataUrl(dataUrl: string, maxSide = 1400, quality = 0.75): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Image decode failed'));
    img.src = dataUrl;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, outW, outH);

  return canvas.toDataURL('image/jpeg', quality);
}

/** Open camera/gallery, return base64 dataURL (compressed). */
export async function captureImageFromCamera(): Promise<string> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  (input as any).capture = 'environment'; // prefer back camera on mobile

  return new Promise<string>((resolve, reject) => {
    input.onchange = async () => {
      try {
        const file = (input as HTMLInputElement).files?.[0];
        if (!file) return reject(new Error('No file selected'));
        const raw = await fileToDataURL(file);
        const compressed = await compressDataUrl(raw, 1400, 0.75);
        resolve(compressed);
      } catch (e) {
        reject(e);
      }
    };

    // modern browsers
    try {
      (input as any).showPicker ? (input as any).showPicker() : input.click();
    } catch {
      input.click();
    }
  });
}

// Simple fetch with a LONG timeout so OCR can finish
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 70000 // 70 seconds, default
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}




 

// ---- Public API used by screens ----
export interface AnalyzeParams {
  imageBase64?: string;
  ingredients?: string;
  barcode?: string;
  lang?: 'zh' | 'en';
}

/** Call Supabase Edge Function */
export async function analyzeProduct(
  params: AnalyzeParams,
): Promise<AnalysisResult> {
  const {
    imageBase64 = '',
    ingredients = '',
    barcode = '',
    lang = 'zh',
  } = params;

  const resp = await fetch(SUPABASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // must match Function check exactly
      Authorization: `Bearer ${SHARED_SECRET}`,
      // required by Supabase Functions gateway
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ image: imageBase64, ingredients, barcode, lang }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Server error ${resp.status}: ${text.slice(0, 300)}`);
  }

  const data = (await resp.json()) as AnalysisResult;

  // 👉 TEMP: no extra overrides here, just return exactly what Supabase sends
  return data;
}
// Default service wrapper so components can import it as GPTImageAnalysisService
const GPTImageAnalysisService = {
  analyzeProduct,
};

export default GPTImageAnalysisService;
