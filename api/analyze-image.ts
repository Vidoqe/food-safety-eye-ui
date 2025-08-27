// /api/analyze-image.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import IngredientAnalysisService from '../scr/services/ingredientAnalysis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    // We accept either overrideText (raw ingredients) or imageBase64 (future)
    const { overrideText, imageBase64 } = (req.body ?? {}) as {
      overrideText?: string;
      imageBase64?: string;
    };

    if (!overrideText && !imageBase64) {
      return res
        .status(400)
        .json({ ok: false, error: 'Provide overrideText or imageBase64' });
    }

    // For now, we analyze text (your analyzer already supports strings)
    const text = overrideText ?? '';
    const result = await IngredientAnalysisService.analyzeIngredients(text, 'free');

    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Internal Server Error',
    });
  }
}
