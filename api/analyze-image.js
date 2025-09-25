// api/analyze-image.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const response = await fetch(process.env.SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    // Try to parse JSON response from Supabase
    let data;
    try {
      data = await response.json();
    } catch {
      // If it wasn’t valid JSON, capture raw text
      const text = await response.text();
      return res.status(response.status).json({
        ok: false,
        error: "Supabase function did not return JSON",
        details: text,
      });
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Server error while contacting Supabase",
      details: error.message,
    });
  }
}
