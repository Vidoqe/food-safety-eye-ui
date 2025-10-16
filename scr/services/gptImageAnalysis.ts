/**
 * Food Safety Eye — UI-side helper to call Supabase Edge Function
 * Logs a bundle marker so you can verify the deployed JS quickly.
 */

console.log("BUNDLE_MARKER_2025-10-16 :: gptImageAnalysis loaded");

/* ================= UI CONFIG (client-side only) ================= */
// Function URL (your real Supabase Edge Function endpoint)
const SUPABASE_URL =
  "https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image";

// Supabase ANON KEY (NOT your OpenAI key)
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3IakuBqddM"; // <-- paste your real anon key

// Must match the secret you set in Supabase “Secrets”
const SHARED_SECRET = "foodsafetysecret456";

/* ================= Types ================= */
export type Risk = "healthy" | "low" | "moderate" | "harmful" | "unknown";

export interface IngredientRow {
  name: string;
  riskLevel: Risk;
  childSafe?: boolean;
  badge?: "green" | "yellow" | "red" | "gray";
  reason?: string;
  taiwanRegulation?: string;
}

export interface AnalysisResult {
  overallResult: {
    risk: "Low" | "Moderate" | "High" | "Unknown";
    message: string;
    childSafeOverall?: boolean;
  };
  table: IngredientRow[];
  used: { hasImage: boolean; hasIngredients: boolean; hasBarcode: boolean };
  raw?: { ingredients?: string; barcode?: string };
}

export interface AnalyzeParams {
  imageBase64?: string; // dataURL (e.g. "data:image/jpeg;base64,...") OR external https URL
  ingredients?: string;
  barcode?: string;
  lang?: "en" | "zh" | string;
}

/* ================= Small helpers ================= */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** open camera/gallery and return compressed dataURL */
export async function captureImageFromCamera(
  maxSide = 1400,
  quality = 0.75
): Promise<string> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  (input as any).capture = "environment";

  const file: File = await new Promise((resolve, reject) => {
    input.onchange = () => {
      const f = (input as HTMLInputElement).files?.[0];
      f ? resolve(f) : reject(new Error("No file selected"));
    };
    try {
      (input as any).showPicker ? (input as any).showPicker() : input.click();
    } catch {
      input.click();
    }
  });

  const raw = await readFileAsDataURL(file);

  // compress on a canvas
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Image decode failed"));
    img.src = raw;
  });

  const { width, height } = img;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, outW, outH);

  return canvas.toDataURL("image/jpeg", quality);
}

/* ================= Fetch with timeout (plus debug logs) ================= */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    console.log("[UI][DEBUG] call →", url, init.headers);
    const resp = await fetch(url, { ...init, signal: controller.signal });
    console.log(
      "[UI][DEBUG] resp ←",
      resp.status,
      `(${Math.round(performance.now() - started)}ms)`
    );
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

/* ================= Public API used by Scan screen ================= */
export async function analyzeProduct(params: AnalyzeParams): Promise<{
  ok: boolean;
  result?: AnalysisResult;
  error?: string;
}> {
  const { imageBase64, ingredients, barcode, lang = "zh" } = params;

  console.log("[UI][DEBUG] analyze overview →", {
    hasImage: !!imageBase64,
    ingredientsLen: ingredients?.length ?? 0,
    lang,
  });

  try {
    const resp = await fetchWithTimeout(
      SUPABASE_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SHARED_SECRET}`, // must match Function check
          apikey: ANON_KEY, // required by Supabase gateway
        },
        body: JSON.stringify({
          image: imageBase64, // dataURL or https URL
          ingredients,
          barcode,
          lang,
        }),
      },
      60000
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { ok: false, error: `HTTP ${resp.status} ${text || ""}`.trim() };
    }

    const json = (await resp.json()) as {
      ok: boolean;
      result?: AnalysisResult;
      error?: string;
    };
    if (!json.ok) return { ok: false, error: json.error || "Unknown error" };
    return { ok: true, result: json.result };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/* ================= Convenience: preview + analyze flow ================= */
export async function captureAndAnalyze(lang: "en" | "zh" | string = "zh") {
  const img = await captureImageFromCamera();
  return analyzeProduct({ imageBase64: img, lang });
}
