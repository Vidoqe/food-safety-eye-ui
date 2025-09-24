// api/analyze-product-image.js
module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { imageBase64, barcode } = req.body || {};
    if (!imageBase64 && !barcode) {
      return res.status(400).json({ ok: false, error: "imageBase64 or barcode required" });
    }

    return res.status(200).json({
      ok: true,
      received: {
        imageBase64: Boolean(imageBase64),
        barcode: barcode || null,
      },
      result: {
        overallRisk: "Moderate",
        tips: ["Placeholder analysis – route works"],
        ingredients: [],
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
