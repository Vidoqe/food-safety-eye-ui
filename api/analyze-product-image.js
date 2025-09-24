export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // ✅ placeholder logic
    res.status(200).json({
      ok: true,
      message: "Image received successfully",
      length: imageBase64.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
