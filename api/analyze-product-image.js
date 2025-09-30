export default async function handler(req, res) { console.log("🔍 Incoming body:", req.body);
console.log("🔑 SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
console.log("🔑 SUPABASE_KEY exists:", !!process.env.VITE_SUPABASE_ANON_KEY);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch {} }

    const { imageUrl, imageBase64 } = body || {};

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({ ok: false, error: "Provide imageUrl or imageBase64" });
    }

    // Placeholder “analysis”
    return res.status(200).json({
      ok: true,
      received: imageUrl ? "url" : "base64",
      imageUrl: imageUrl || null,
      length: imageBase64 ? imageBase64.length : undefined,
      endpoint: "analyze-product-image"
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error", details: String(err && err.message ? err.message : err) });
  }
}
