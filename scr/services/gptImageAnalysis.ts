export async function gptImageAnalysis(data: any) {
  // Get your Supabase Edge Function URL and shared secret from .env.local
  const url = import.meta.env.VITE_SUPABASE_EDGE_URL;
  const secret = import.meta.env.VITE_EDGE_SHARED_SECRET;

  console.log("Sending data to:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Edge function error:", res.status, errorText);
    throw new Error(`Edge function returned ${res.status}`);
  }

  const result = await res.json();
  console.log("Edge function success:", result);
  return result;
}
