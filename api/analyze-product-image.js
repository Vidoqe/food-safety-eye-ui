import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    // Parse body safely
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { imageBase64 } = body || {};
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ ok: false, error: "No imageBase64 provided" });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Decode Base64 and upload
    const fileName = `scan-${Date.now()}.jpg`;
    const imageData = Buffer.from(imageBase64.split(',')[1], 'base64');

    const { data, error } = await supabase.storage
      .from('scans')
      .upload(fileName, imageData, { contentType: 'image/jpeg' });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('scans')
      .getPublicUrl(fileName);

    // Success response
    return res.status(200).json({
      ok: true,
      message: "Image uploaded successfully",
      fileName,
      imageUrl: publicUrlData.publicUrl
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Server error",
      details: err.message
    });
  }
}
