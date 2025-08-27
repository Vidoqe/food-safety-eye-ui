// /api/analyze-image.ts
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { overrideText } = (req.body ?? {}) as { overrideText?: string };

    if (!overrideText) {
      return res.status(400).json({ ok: false, error: 'Missing overrideText' });
    }

    // Dynamic import to avoid ESM/CJS mismatch
    const mod = await import('../scr/services/ingredientAnalysis');
    const Service = (mod as any).default;

    const result = await Service.analyzeIngredients(overrideText, 'free');
    return res.status(200).json({ ok: true, result });

  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Internal Server Error',
    });
  }
}
