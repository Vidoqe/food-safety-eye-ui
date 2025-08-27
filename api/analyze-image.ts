// /api/analyze-image.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    // Vercel parses JSON automatically when Content-Type is application/json
    const { overrideText, imageBase64, overrideBarcode } = (req.body ?? {}) as {
      overrideText?: string;
      imageBase64?: string;
      overrideBarcode?: string;
    };

    // Echo back what we got, plus whether your OpenAI key is visible
    return res.status(200).json({
      ok: true,
      received: {
        overrideText,
        hasImage: Boolean(imageBase64),
        overrideBarcode,
      },
      env: { hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY) },
    });
  } catch (err: any) {
    console.error('analyze-image error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

