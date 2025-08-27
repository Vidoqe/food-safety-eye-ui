import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  try {
    return res.status(200).json({
      ok: true,
      body: req.body,
      envKey: !!process.env.OPENAI_API_KEY,
    });
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
