// api/analyze-product-image.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { image, barcode, language = "en", ...rest } = req.body || {};

    if (!image && !barcode) {
      return res.status(400).json({ ok: false, error: "image or barcode is required" });
    }

    // Normalize data URL -> raw base64 (optional; harmless if already raw)
    const imageBase64 = typeof image === "string"
      ? image.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
      : undefined;

    // TODO: call your actual analyzer here with imageBase64/barcode/language/rest
    // For now, return a minimal stub so we can verify the route works
    return res.status(200).json({
      ok: true,
      received: {
        hasImage: !!imageBase64,
        hasBarcode: !!barcode,
        language,
        extra: rest
      }
    });
  } catch (err) {
    console.error("analyze-product-image error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
