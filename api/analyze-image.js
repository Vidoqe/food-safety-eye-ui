module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    const { imageBase64 } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: "No image provided" });
    }
    // placeholder
    return res.status(200).json({ ok: true, length: imageBase64.length });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};