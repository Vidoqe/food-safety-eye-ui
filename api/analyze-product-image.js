// api/analyze-product-image.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { image, barcode, language } = req.body || {};
    const imgStr = typeof image === 'string' ? image : '';
    const preview = imgStr.slice(0, 40);

    res.status(200).json({
      ok: true,
      diagnostics: {
        hasImage: !!imgStr,
        imagePreview: preview,
        imageLength: imgStr.length,
        barcode: barcode || null,
        language: language || null,
      },
      ingredients: [
        { name: "Sugar", risk: "Moderate", childRisk: "Moderate", badge: "🟡" },
        { name: "Salt", risk: "Low", childRisk: "Low", badge: "🟢" }
      ],
      verdict: "Moderate Risk (limit intake)",
      tips: ["Contains moderate-risk additives. Limit intake."]
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
};
