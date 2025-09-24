// api/ping.js
module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    now: new Date().toISOString(),
    note: "Serverless functions are working."
  });
};