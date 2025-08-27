// /api/analyze-image.ts
// Vercel Serverless Function (Node runtime)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import IngredientAnalysisService from '../scr/services/ingredientAnalysis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { overrideText, imageBase64 } = (req.body || {}) as {
      overrideText?: string;
      imageBase64?: string;
    };

    if (!overrideText && !imageBase64) {
      return res.status(400).json({ error: 'Provide overrideText or imageBase64' });
    }

    // For now we only use overrideText (OCR later)
    const text = (overrideText || '').toString();

    const result = await IngredientAnalysisService.analyzeIngredients(text, 'free');
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('analyze-image error:', err);
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) });
  }
}

