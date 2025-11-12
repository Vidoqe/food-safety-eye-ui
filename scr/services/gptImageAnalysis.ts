export async function AnalyzeProduct(payload: any, ac?: AbortController) {
  const url = import.meta.env.VITE_SUPABASE_EDGE_URL!;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_EDGE_SHARED_SECRET}`,
    },
    body: JSON.stringify(payload),
    signal: ac?.signal,
  });

  if (!res.ok) throw new Error(`Edge returned ${res.status}`);
  return await res.json();
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
