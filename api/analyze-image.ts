// /api/analyze-image.ts
// Serverless route that accepts POST { overrideText?: string, imageBase64?: string }
// and returns an AnalysisResult by calling the local IngredientAnalysisService.

import type { NextApiRequest, NextApiResponse } from 'next'
// We can import your local analyzer directly from scr/ (relative to repo root)
import IngredientAnalysisService from '../scr/services/ingredientAnalysis'

// Small helper to allow both Next.js and Vercel runtime
type Req = NextApiRequest | any
type Res = NextApiResponse | any

export default async function handler(req: Req, res: Res) {
  try {
    // Allow preflight (CORS if you ever need cross-origin)
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return res.status(204).end()
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    // In Vercel’s Node runtime, body is already parsed for JSON requests.
    const { overrideText, imageBase64 } = req.body || {}

    // For now we only support text (we can add OCR later)
    const text: string = (overrideText || '').toString().trim()

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Provide overrideText or imageBase64' })
    }

    // If imageBase64 was sent, we'd normally OCR here.
    // For this step, we rely on overrideText.
    const input = text || '' // fallback empty

    const result = await IngredientAnalysisService.analyzeIngredients(
      input,
      // keep signature stable with your class definition
      'free'
    )

    return res.status(200).json(result)
  } catch (err: any) {
    console.error('analyze-image error:', err)
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) })
  }
}
