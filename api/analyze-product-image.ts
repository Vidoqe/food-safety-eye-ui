// api/analyze-product-image.ts
// Receives { image: base64DataURL, barcode?: string, language?: 'en'|'zh' } and
// calls OpenAI Vision to extract ingredients + analysis, then returns strict JSON.

type AnalysisResponse = {
  ingredients: string[];
  verdict: string;
  tips: string[];
  extractedIngredients: string[];
  regulatedAdditives: string[];
  isNaturalProduct: boolean;
  junkFoodScore: number;           // 0-100
  quickSummary: string;
  overallSafety: string;           // "Low" | "Moderate" | "High" etc.
  summary: string;
  warnings: string[];
  barcode?: string;
  healthWarnings: string[];
  scanInfo?: string;
  creditsExpiry?: string;
  overall_risk?: string;           // kept for backward-compat
  child_safe?: boolean;
  notes?: string;
  debug?: { model?: string; tookMs?: number; raw?: unknown };
};

const MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper: pull first JSON object from LLM text
function findFirstJsonObject(text: string): any | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const sliced = text.slice(start, end + 1);
    return JSON.parse(sliced);
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const t0 = Date.now();

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed. Use POST." });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    return;
  }

  try {
    const { image, barcode, language = "en" } = req.body || {};

    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Missing 'image' (base64 data URL) in body." });
      return;
    }

    // Safety: trim very large images (OpenAI can take base64 data URLs; we rely on frontend compression)
    if (!image.startsWith("data:image/")) {
      // Allow bare base64 too, but wrap if needed
      res.status(400).json({ error: "Expected a data URL (data:image/*;base64,...)." });
      return;
    }

    const systemPrompt = `
You are a food label analyzer. You will receive a photo of a product's ingredient list.
Extract the ingredient list verbatim (as an array of strings), then analyze risks (additives, allergens, preservatives).
Return STRICT JSON with this TypeScript shape (no extra commentary):

{
  "ingredients": string[],                 // cleaned, deduplicated
  "verdict": string,                       // short headline (e.g., "Moderate Risk (limit intake)")
  "tips": string[],                        // 1-4 short actionable tips
  "extractedIngredients": string[],        // raw extracted lines/phrases
  "regulatedAdditives": string[],          // E-numbers or named additives if present
  "isNaturalProduct": boolean,
  "junkFoodScore": number,                 // 0 (good) to 100 (junk)
  "quickSummary": string,
  "overallSafety": "Low"|"Moderate"|"High",
  "summary": string,                       // 1–2 sentences
  "warnings": string[],                    // e.g., "Contains gluten"
  "barcode": string | null,
  "healthWarnings": string[],
  "scanInfo": string | null,
  "creditsExpiry": string | null,
  "overall_risk": "Low"|"Moderate"|"High",
  "child_safe": boolean,
  "notes": string | null
}

If ingredients cannot be read, set arrays to [] and write in "summary" that the list was unreadable.
Prefer ${language === "zh" ? "Chinese" : "English"} for text. Keep it concise.
`;

    const body = {
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Please analyze this product label. Language: ${language}. ${barcode ? `Barcode: ${barcode}.` : ""}` },
            { type: "input_image", image_url: { url: image } },
          ],
        },
      ],
      temperature: 0.2,
      response_format: { type: "text" },
    };

    // Call OpenAI (chat.completions-compatible for vision models that accept image_url)
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({ error: `OpenAI error: ${r.status} ${r.statusText}`, details: text });
      return;
    }

    const data = await r.json();

    const content: string =
      data?.choices?.[0]?.message?.content ??
      "";

    let parsed: Partial<AnalysisResponse> | null = findFirstJsonObject(content);

    if (!parsed) {
      // Fallback minimal payload
      parsed = {
        ingredients: [],
        extractedIngredients: [],
        verdict: "Moderate Risk (limit intake)",
        tips: [],
        regulatedAdditives: [],
        isNaturalProduct: false,
        junkFoodScore: 50,
        quickSummary: "",
        overallSafety: "Moderate",
        summary: "Could not reliably read the ingredient list from the photo.",
        warnings: [],
        barcode,
        healthWarnings: [],
        overall_risk: "Moderate",
        child_safe: false,
        notes: ""
      };
    }

    // Ensure required fields exist with sane defaults
    const safe: AnalysisResponse = {
      ingredients: parsed.ingredients ?? [],
      verdict: parsed.verdict ?? "Moderate Risk (limit intake)",
      tips: parsed.tips ?? [],
      extractedIngredients: parsed.extractedIngredients ?? [],
      regulatedAdditives: parsed.regulatedAdditives ?? [],
      isNaturalProduct: !!parsed.isNaturalProduct,
      junkFoodScore: typeof parsed.junkFoodScore === "number" ? parsed.junkFoodScore : 50,
      quickSummary: parsed.quickSummary ?? "",
      overallSafety: (parsed.overallSafety as any) ?? "Moderate",
      summary: parsed.summary ?? "",
      warnings: parsed.warnings ?? [],
      barcode: parsed.barcode ?? barcode,
      healthWarnings: parsed.healthWarnings ?? [],
      scanInfo: parsed.scanInfo ?? null,
      creditsExpiry: parsed.creditsExpiry ?? null,
      overall_risk: (parsed.overall_risk as any) ?? "Moderate",
      child_safe: typeof parsed.child_safe === "boolean" ? parsed.child_safe : false,
      notes: parsed.notes ?? "",
      debug: { model: MODEL, tookMs: Date.now() - t0 }
    };

    res.status(200).json(safe);
  } catch (err: any) {
    res.status(500).json({
      error: "Unhandled server error",
      message: err?.message || String(err),
    });
  }
}
