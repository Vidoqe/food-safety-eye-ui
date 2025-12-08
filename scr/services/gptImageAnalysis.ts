// scr/services/gptImageAnalysis.ts
// Simple helper to call the Supabase Edge Function without AbortController
// to avoid "signal is aborted without reason" errors.

export interface AnalyzeProductPayload {
  imageBase64?: string;   // for label scans
  ingredients?: string;   // for manual input
  barcode?: string;       // (not used right now, but kept for future)
  lang: "zh" | "en";
  mode: "label" | "barcode" | string;
}

export interface AnalyzeProductResponse {
  // We keep this loose so backend changes don't break the UI
  verdict?: any;
  ingredients?: any[];
  error?: string | null;
  [key: string]: any;
}

const EDGE_URL = import.meta.env.VITE_SUPABASE_EDGE_URL;

if (!EDGE_URL) {
  console.warn(
    "[UI] VITE_SUPABASE_EDGE_URL is not set – image / ingredient analysis will fail."
  );
}

export async function analyzeProduct(
  payload: AnalyzeProductPayload
): Promise<AnalyzeProductResponse> {
  if (!EDGE_URL) {
    throw new Error("Missing VITE_SUPABASE_EDGE_URL");
  }

  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // IMPORTANT: no AbortController / signal here,
      // so we never get "signal is aborted without reason"
    });

    if (!res.ok) {
      // Try to read error body for debugging
      let text = "";
      try {
        text = await res.text();
      } catch {
        // ignore
      }
      console.error("[UI] Edge function HTTP error", res.status, text);
      throw new Error(`Edge function error: ${res.status}`);
    }

    const data = (await res.json()) as AnalyzeProductResponse;
    console.log("[UI] analyzeProduct response:", data);
    return data;
  } catch (err: any) {
    console.error("[UI] analyzeProduct network/error:", err);
    // Re-throw so ScanScreen can show a friendly message
    throw err;
  }
}
