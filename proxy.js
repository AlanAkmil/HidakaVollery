export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  // Jikan v4 API (MAL) — no key needed, always online
  const API_BASE = 'https://api.jikan.moe/v4';
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(req.query).forEach(([k, v]) => {
    if (k !== 'path') url.searchParams.set(k, v);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'HidakaRead/1.0', 'Accept': 'application/json' },
    });
    if (!response.ok) return res.status(response.status).json({ error: `Upstream ${response.status}` });
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
