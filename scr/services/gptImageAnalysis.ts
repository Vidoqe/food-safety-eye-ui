export async function AnalyzeProduct(payload: any, ac?: AbortController) {
  const EDGE_URL = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const SHARED_SECRET = import.meta.env.VITE_EDGE_SHARED_SECRET;

  try {
    const res = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SHARED_SECRET}`,
      },
      body: JSON.stringify(payload),
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

export type AnalyzeResult = {
  ingredient: string;
  riskLevel: "healthy" | "moderate" | "harmful";
  childRisk: boolean | "unknown";
  badge: "green" | "yellow" | "red" | "gray";
  taiwanFDA: string;
  comment: string;
  analysis: string;
};
