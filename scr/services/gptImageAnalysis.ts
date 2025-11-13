export async function AnalyzeProduct(payload: any, ac?: AbortController) {
  const EDGE_URL = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const SHARED_SECRET = import.meta.env.VITE_EDGE_SHARED_SECRET;

  try {
    if (!EDGE_URL) {
      throw new Error("VITE_SUPABASE_EDGE_URL is not set");
    }

    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shared-secret": SHARED_SECRET ?? "",
      },
      body: JSON.stringify({
        ingredients: payload.ingredients,
      }),
      signal: ac?.signal,
    });

    if (!res.ok) {
      throw new Error(`Edge returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[AnalyzeProduct] Error calling Edge:", err);
    throw err;
  }
}
