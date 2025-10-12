/**
 * scr/services/gptImageAnalysis.ts — Food Safety Eye (UI)
 * Calls Supabase Edge Function `analyze-product-image`
 * Uses shared secret auth + loud debug logs.
 * Updated: 2025-10-12
 */

console.log("BUNDLE_MARKER_2025-10-12 :: gptImageAnalysis loaded");

/* ========================= CONFIG =========================
 * 1) SUPABASE_URL  → your function invoke URL
 * 2) ANON_KEY      → your Supabase anon (public) key
 * 3) SHARED_SECRET → MUST match the secret your function checks
 * ========================================================= */
const SUPABASE_URL =
  "https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image";
const ANON_KEY = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3pobHVna3h5dGlvbnlybm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzQ5OTQsImV4cCI6MjA2NzYxMDk5NH0.LK8YHE_JDl0Mj0vl-SFhAbUvrpLu-rIbL3IakuBqddM>";
const SHARED_SECRET = "foodsafetysecret456"; // <-- your new shared secret

/* ======================= TYPES ======================= */
export type AnalyzeParams = {
  imageBase64?: string; // data URL: "data:image/jpeg;base64,..."
  barcode?: string;
  ingredients?: string;
  lang?: "zh" | "en" | "zh-hant" | string;
};

export type AnalysisResponse = {
  ok: boolean;
  result?: any;
  error?: string;
};

/* ============ Small helper: fetch + timeout ============ */
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
    console.log("[UI][DEBUG] fetch -> status:", resp.status, `(${ms}ms)`);
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

/* ===================== Public API ===================== */
export async function analyzeProduct(params: AnalyzeParams): Promise<AnalysisResponse> {
  const { imageBase64 = "", barcode = "", ingredients = "", lang = "zh" } = params;

  console.log("[UI][DEBUG] analyzeProduct about to fetch →", {
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
          // 🔐 MUST match your Edge Function auth check:
          Authorization: `Bearer ${SHARED_SECRET}`,
          // Required by Supabase Functions Gateway:
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

    // Log a short preview of the response body for quick debugging
    const textPreview = await response
      .clone()
      .text()
      .then((t) => t.slice(0, 300))
      .catch(() => "");
    console.log("[UI][DEBUG] fetch -> text(0..300):", textPreview || "(empty)");

    if (!response.ok) {
      return { ok: false, error: `Server error ${response.status}: ${textPreview}` };
    }

    const json = await response.json().catch(() => null);
    if (!json) return { ok: false, error: "Malformed JSON from server" };

    return { ok: true, result: json };
  } catch (err: any) {
    console.error("[UI][ERROR] analyzeProduct threw:", err?.message ?? err);
    return { ok: false, error: String(err?.message ?? err) };
  }
}

/* ============== Optional: camera capture helper ============== */
export async function captureImageFromCamera(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    (input as any).capture = "environment";
    input.onchange = async () => {
      try {
        const file = (input as HTMLInputElement).files?.[0];
        if (!file) return reject(new Error("No file selected"));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    };
    input.onerror = () => reject(new Error("Camera/file picker failed"));
    input.click();
  });
}

/* =================== Default-style export =================== */
export const GPTImageAnalysisService = {
  analyzeProduct,
  captureImageFromCamera,
};
