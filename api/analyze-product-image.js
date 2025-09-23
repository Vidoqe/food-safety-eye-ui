/* api/analyze-product-image.js */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    let body = req.body;

    // If body came in as string (sometimes happens), parse it
    if (typeof body === "string" && ct.includes("application/json")) {
      try { body = JSON.parse(body); } catch {}
    }

    const imageBase64 = body?.image || body?.imageBase64 || null;
    const barcode     = body?.barcode || null;
    const language    = body?.language || "en";

    if (!imageBase64 && !barcode) {
      return res.status(400).json({ ok: false, error: "image or barcode required" });
    }

    // --- Mock minimal analysis so UI shows rows (replace later with real OCR/LLM) ---
    const extractedIngredients = ["water", "sugar", "salt"]; // demo list
    const result = {
      ingredients: extractedIngredients,
      verdict: "Moderate Risk (limit intake)",
      tips: ["Contains moderate-risk additives. Limit intake."],
      extractedIngredients,
      regulatedAdditives: [],
      isNaturalProduct: false,
      junkFoodScore: 50,
      quickSummary: "Demo response so UI renders content.",
      overallSafety: "moderate",
      summary: "This is a placeholder analysis response.",
      warnings: [],
      barcode,
      healthWarnings: [],
      scanInfo: `mode=${imageBase64 ? "image" : "barcode"} lang=${language}`,
      creditsExpiry: "",
      overall_risk: "moderate",
      child_safe: true,
      notes: ""
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
