export async function AnalyzeProduct(payload: any, ac?: AbortController) {
  // Read from Vite env vars
  const edgeUrl = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const sharedSecret = import.meta.env.VITE_EDGE_SHARED_SECRET;

  console.log("[AnalyzeProduct] edgeUrl from env:", edgeUrl);

  if (!edgeUrl) {
    throw new Error("VITE_SUPABASE_EDGE_URL is not set");
  }

  try {
    const res = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shared-secret": sharedSecret ?? "",
      },
      body: JSON.stringify({
        ingredients:
          payload.ingredients || payload.text || payload.input || "",
        barcode: payload.barcode || "",
      }),
      signal: ac?.signal,
    });

    if (!res.ok) {
      throw new Error(`Edge returned ${res.status}`);
    }

    const data = await res.json();
    console.log("[AnalyzeProduct] Edge data:", data);
    return data; // frontend receives the JSON directly
  } catch (err) {
    console.error("[AnalyzeProduct] Error calling Edge:", err);
    throw err;
  }
}
