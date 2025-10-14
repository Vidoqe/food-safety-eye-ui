/**
 * scr/services/gptImageAnalysis.ts
 * Food Safety Eye – Frontend service for Supabase Edge Function
 * Auth → uses shared secret “foodsafetysecret456”
 * Includes guard to skip empty requests (avoid 400 errors)
 */

console.log("BUNDLE_MARKER_2025-10-14 :: gptImageAnalysis loaded");

// ============ CONFIG ============

const SUPABASE_URL =
  "https://hqgzhlugkxytionynor.supabase.co/functions/v1/analyze-product-image";

// Your Supabase anon key
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."; // ← keep your same key

// Shared secret must match the one in Supabase → Secrets → SHARED_SECRET
const SHARED_SECRET = "foodsafetysecret456";

// ============ MAIN FUNCTION ============

export async function analyzeProduct(params: {
  imageBase64?: string;
  barcode?: string;
  ingredients?: string;
  lang?: string;
}): Promise<{ ok: boolean; result?: any; error?: string }> {
  const { imageBase64 = "", barcode = "", ingredients = "", lang = "zh" } =
    params;

  // --- sanity logs (so you can see what goes in) ---
  console.log("[UI][DEBUG] analyzeProduct overview →", {
    image: imageBase64 ? `${imageBase64.length} chars` : "none",
    barcode,
    ingredientsLen: ingredients?.length ?? 0,
  });

  // ✅ prevent sending empty payload (avoids 400 error)
  if (!imageBase64 && !ingredients && !barcode) {
    console.warn(
      "[UI] Skipping request → no image, no ingredients, no barcode."
    );
    return { ok: false, error: "No input provided." };
  }

  try {
    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SHARED_SECRET}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify({
        image: imageBase64,
        barcode,
        ingredients,
        lang,
      }),
    });

    if (!response.ok) {
      console.error("Edge Function HTTP Error →", response.status);
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log("[UI] Supabase Response →", data);
    return { ok: true, result: data };
  } catch (err: any) {
    console.error("[UI] Fetch Error →", err?.message || err);
    return { ok: false, error: err?.message || "Fetch failed" };
  }
}