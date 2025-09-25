export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    // Vercel usually parses JSON, but be defensive
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { /* ignore */ }
    }

    const { imageBase64 } = body || {};
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ ok: false, error: "No imageBase64 provided" });
    }

    // 👉 Placeholder “analysis”
    return res.status(200).json({
      ok: true,
      message: "Image received successfully",
      length: imageBase64.length,
      endpoint: "analyze-product-image"
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Server error",
      details: String(err && err.message ? err.message : err)
    });
  }
}
