// api/analyze-image.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }
    const { overrideText } = req.body ?? {};
    return res.status(200).json({
      ok: true,
      got: overrideText,
      env: { hasOpenAIKey: !!process.env.OPENAI_API_KEY },
    });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
