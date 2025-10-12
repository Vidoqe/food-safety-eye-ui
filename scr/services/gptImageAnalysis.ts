/**
 * src/services/gptImageAnalysis.ts  — Food Safety Eye (UI)
 * Calls Supabase Edge Function `analyze-product-image`
 * Auth uses a shared secret (string) that MUST match the Function check.
 * Logs enough info to debug in DevTools.
 */

console.log("[UI] gptImageAnalysis loaded");

/* =======================  CONFIG  ======================= */
/** 1) Your Supabase Edge Function (public) URL  */
const SUPABASE_URL =
  "https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image";

/** 2) Supabase ANON key (public; from Project Settings → API → anon key) */
const ANON_KEY = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3IakuBqddM>";

/** 3) 🔐 SHARED SECRET sent in the Authorization header (string)
 *  ───────────────────────────────────────────────────────────
 *  ⬇⬇⬇  PUT YOUR SECRET HERE (must match the Function)  ⬇⬇⬇
 *  Example you asked for: "foodsafetysecret123"
 */
const SHARED_SECRET = "foodsafetysecret123";
/* ======================================================== */

/** Converts a File to data:URL */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Compress a data:URL down to ~1400px max side as JPEG for upload */
async function compressDataUrl(
  dataUrl: string,
  maxSide = 1400,
  quality = 0.75
): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise((res, rej) => {
    img.onload = () => res(null);
    img.onerror = () => rej(new Error("Image decode failed"));
    img.src = dataUrl;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, outW, outH);

  return canvas.toDataURL("image/jpeg", quality);
}

/** Open camera/file picker and return a compressed image as data:URL */
export async function captureImageFromCamera(): Promise<string> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  (input as any).capture = "environment";

  return new Promise<string>((resolve, reject) => {
    input.onchange = async () => {
      try {
        const file = (input as HTMLInputElement).files?.[0];
        if (!file) return reject(new Error("No file selected"));
        const raw = await fileToDataURL(file);
        const compressed = await compressDataUrl(raw, 1400, 0.75);
        console.log("[UI] captured image dataUrl length:", compressed.length);
        resolve(compressed);
      } catch (err) {
        reject(err);
      }
    };
    input.onerror = () => reject(new Error("Camera/file picker failed"));
    input.click();
  });
}

/** fetch with timeout + DEBUG logs */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  console.log("[UI][DEBUG] calling fetch URL:", url);
  console.log("[UI][DEBUG] request headers:", init?.headers);

  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    const ms = Math.round(performance.now() - started);
    console.log("[UI][DEBUG] fetch response status:", resp.status, `(${ms}ms)`);
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

/** Public API used by Scan screens */
export type AnalyzeParams = {
  imageBase64?: string;
  barcode?: string;
  ingredients?: string;
  lang?: "zh" | "en" | "zh-hant" | "zh-Hant" | "zh_TW";
};

export type GPTRisk = "healthy" | "low" | "moderate" | "harmful" | "unknown";

export type IngredientRow = {
  name: string;
  name_zh?: string;
  status?: GPTRisk;
  badge?: string;
  childSafe?: boolean;
  reason?: string;
  taiwanRegulation?: string;
  chinese?: string;
};

export type AnalysisResult = {
  verdict: GPTRisk;
  ingredients: IngredientRow[];
  tips?: string[];
  summary?: string;
};

export type AnalysisResponse = {
  ok: boolean;
  result?: AnalysisResult;
  error?: string;
};

/** Main call from UI → Supabase Function */
export async function analyzeProduct(params: AnalyzeParams): Promise<AnalysisResponse> {
  const { imageBase64 = "", barcode = "", ingredients = "", lang = "zh" } = params;

  // sanity logs (never log the whole body)
  console.log("[UI][DEBUG] analyzeProduct: overview →", {
    image: imageBase64 ? `${imageBase64.length} chars` : "none",
    barcode,
    ingredientsLen: ingredients?.length ?? 0,
    lang,
  });

  try {
    const response = await fetchWithTimeout(
      SUPABASE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          /** 🔐 This MUST match the Function check exactly */
          Authorization: `Bearer ${SHARED_SECRET}`,
          /** Required by Supabase Functions Gateway (public key) */
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ image: imageBase64, barcode, ingredients, lang }),
      },
      35000
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[UI] Edge Function error:", response.status, text?.slice(0, 300));
      // translate common auth/URL mistakes into friendly hints
      if (response.status === 401) {
        return { ok: false, error: "Unauthorized (check SHARED_SECRET on UI & Function)" };
      }
      if (response.status === 404) {
        return { ok: false, error: "Function URL not found (check SUPABASE_URL)" };
      }
      return { ok: false, error: `Server error ${response.status}` };
    }

    const result = (await response.json()) as AnalysisResult;
    console.log("[UI] Edge Function JSON received:", result);

    // minimal normalization so UI never crashes
    if (!result || !result.verdict) {
      return { ok: false, error: "Malformed response from server" };
    }
    (result as any).ingredients = Array.isArray(result.ingredients)
      ? result.ingredients
      : [];

    return { ok: true, result };
  } catch (err: any) {
    console.error("[UI] analyzeProduct threw:", err?.message ?? err);
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/** Convenient default export for screens */
export const GPTImageAnalysisService = {
  captureImageFromCamera,
  analyzeProduct,
};
