import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Create a new OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, barcode, manualInput } = req.body;

    if (!imageBase64 && !barcode && !manualInput) {
      return res.status(400).json({ error: 'No input provided' });
    }

    // Construct the prompt depending on input
    let prompt = '';
    if (manualInput) {
      prompt = `Analyze these food ingredients for safety and risks (Taiwan FDA context):\n${manualInput}`;
    } else if (barcode) {
      prompt = `Analyze this product with barcode ${barcode} for food safety and risks (Taiwan FDA context).`;
    } else if (imageBase64) {
      prompt = `Analyze the text from this food product label for ingredients and risks (Taiwan FDA context).`;
    }

    // Send request to GPT-4o-mini (fast and cheaper)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a food safety assistant. Identify ingredients, assign a risk level (Low, Moderate, High), note child risks, and Taiwan FDA restrictions if applicable.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
    });

    const analysis = response.choices[0].message?.content ?? 'No analysis generated';

    res.status(200).json({ success: true, analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
