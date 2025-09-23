// api/ping.js
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    now: Date.now(),
    note: "Serverless functions are working."
  });
}