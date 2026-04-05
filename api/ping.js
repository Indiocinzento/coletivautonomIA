export default function handler(req, res) {
  res.status(200).json({ status: 'viva', metodo: req.method, headers: req.headers });
}
