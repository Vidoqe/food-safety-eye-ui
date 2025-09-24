// Simple health check
module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    now: Date.now(),
    note: "Serverless functions are working."
  });
};