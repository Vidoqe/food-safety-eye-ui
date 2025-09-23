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

  // Body might come in as string or already-parsed object
  let body: any = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const image = body?.image as string | undefined;
  const language = (body?.language as string | undefined) ?? 'en';

  const diagnostics: Record<string, any> = {
    received: !!image,
    language,
    imageType: typeof image,
    imageStartsWith: image ? image.slice(0, 30) : '',
    imageLength: image?.length ?? 0,
    note: 'This diagnostics block is here to confirm the frontend really sent a data URL.',
  };

  // Validate image
  if (!image) {
    return res.status(400).json({
      ok: false,
      error: 'No image provided in request body.',
      diagnostics,
    });
  }

  // Must be a data URL: data:image/png;base64,xxxx or data:image/jpeg;base64,xxxx
  const isDataUrl = /^data:image\/[a-zA-Z]+;base64,/.test(image);
  if (!isDataUrl) {
    return res.status(400).json({
      ok: false,
      error: 'Image is not a base64 data URL (expected data:image/...;base64,...)',
      diagnostics,
    });
  }

  // ====== PLACEHOLDER ANALYSIS ======
  // For now, we’ll return a tiny fake analysis so the table fills in.
  // Once we confirm imageLength > 1000 and the Data URL looks good,
  // we’ll plug in the real OCR + GPT analysis.
  const fakeRows: AnalysisRow[] = [
    {
      ingredient: 'Water',
      riskLevel: 'Low',
      childRisk: 'No',
      badge: 'green',
      taiwanFda: 'No specific restriction',
    },
    {
      ingredient: 'Sugar',
      riskLevel: 'Moderate',
      childRisk: 'Unknown',
      badge: 'yellow',
      taiwanFda: 'No specific restriction',
    },
  ];

  return res.status(200).json({
    ok: true,
    overall: {
      verdict: 'Moderate Risk (limit intake)',
      summary: 'Temporary placeholder analysis to verify data flow.',
      tips: ['If you see these rows, the API received the image correctly.'],
    },
    diagnostics,
    ingredients: fakeRows,
  });
}
