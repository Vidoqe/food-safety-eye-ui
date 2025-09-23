// api/analyze-product-image.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AnalysisRow = {
  ingredient: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Unknown';
  childRisk: 'Yes' | 'No' | 'Unknown';
  badge: 'green' | 'yellow' | 'red' | 'gray';
  taiwanFda: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Body might be a string; parse if needed.
  let body: any = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const image = body?.image as string | undefined;
  const language = (body?.language as string | undefined) ?? 'en';

  const diagnostics = {
    received: !!image,
    language,
    imageType: typeof image,
    imageStartsWith: image ? image.slice(0, 30) : '',
    imageLength: image?.length ?? 0,
    route: '/api/analyze-product-image',
    note: 'Expect image to be a data URL: data:image/...;base64,...',
  };

  if (!image) {
    return res.status(400).json({ ok: false, error: 'No image provided.', diagnostics });
  }

  const isDataUrl = /^data:image\/[a-zA-Z]+;base64,/.test(image);
  if (!isDataUrl) {
    return res.status(400).json({
      ok: false,
      error: 'Image is not a base64 data URL (expected data:image/...;base64,...)',
      diagnostics,
    });
  }

  // TEMPORARY FAKE ANALYSIS so UI can populate while we debug the pipe.
  const rows: AnalysisRow[] = [
    { ingredient: 'Water',  riskLevel: 'Low',      childRisk: 'No',       badge: 'green',  taiwanFda: 'No specific restriction' },
    { ingredient: 'Sugar',  riskLevel: 'Moderate', childRisk: 'Unknown',  badge: 'yellow', taiwanFda: 'No specific restriction' },
  ];

  return res.status(200).json({
    ok: true,
    overall: {
      verdict: 'Moderate Risk (limit intake)',
      summary: 'Placeholder until OCR+GPT is reattached.',
      tips: ['Seeing these rows means the API received the image correctly.'],
    },
    diagnostics,
    ingredients: rows,
  });
}
