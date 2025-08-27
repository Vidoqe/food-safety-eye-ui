// /api/analyze-image.ts
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { overrideText, imageBase64 } = (req.body ?? {}) as {
      overrideText?: string;
      imageBase64?: string;
    };

    if (!overrideText && !imageBase64) {
      return res
        .status(400)
        .json({ ok: false, error: 'Provide overrideText or imageBase64' });
    }

    // IMPORTANT: dynamic import avoids CJS/ESM mismatches during bundling
    const mod = await import('../scr/services/ingredientAnalysis');
    const Service =
      (mod as any).default ?? (mod as any).IngredientAnalysisService;

    const text = overrideText ?? '';
    const result = await Service.analyzeIngredients(text, 'free');

    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || 'Internal Server Error' });
  }
}
