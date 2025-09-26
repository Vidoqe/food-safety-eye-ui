// api/analyze-product-image.js
export default async function handler(req, res) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    // Vercel usually parses JSON, but handle the string-body case too
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ ok: false, error: "Invalid JSON body" });
      }
    }

    const { imageBase64 } = body || {};
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ ok: false, error: "No imageBase64 provided" });
    }

    // 🔸 Placeholder logic (replace later with real analysis)
    return res.status(200).json({
      ok: true,
      message: "Image received successfully",
      length: imageBase64.length,
      endpoint: "analyze-product-image",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Server error",
      details: err?.message || String(err),
    });
  }
}
