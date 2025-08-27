// /api/analyze-image.ts  (ESM)
import type { VercelRequest, VercelResponse } from '@vercel/node';

// NOTE: your project folder is named "scr", not "src".
import IngredientAnalysisService from '../scr/services/ingredientAnalysis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { overrideText, imageBase64, overrideBarcode } = (req.body ?? {}) as {
      overrideText?: string;
      imageBase64?: string;
      overrideBarcode?: string;
    };

    // For now we support text-first; image/barcode can be added later
    if (!overrideText && !imageBase64) {
      return res.status(400).json({
        ok: false,
        error: 'Provide overrideText or imageBase64',
      });
    }

    // Use our local deterministic analyzer
    const result = await IngredientAnalysisService.analyzeIngredients(
      overrideText ?? '',
      'free'
    );

    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    console.error('analyze-image error:', err);
    return res.status(500).json({ ok: false, error: err?.message ?? 'Server error' });
  }
}
