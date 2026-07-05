// Vercel serverless function: proxies Finnhub company-news (free tier) so the
// "/" quote lookup can show recent headlines per ticker without exposing the key.
export default async function handler(req, res) {
  const sym = String(req.query.symbol || "").trim().toUpperCase();
  if (!/^[A-Z.]{1,10}$/.test(sym)) return res.status(400).json({ error: "bad symbol" });
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(503).json({ error: "not configured" });
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  try {
    const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${from}&to=${to}&token=${key}`);
    const d = await r.json();
    const items = (Array.isArray(d) ? d : []).slice(0, 5)
      .filter(x => x && x.headline && x.url)
      .map(x => ({ headline: x.headline, source: x.source || "", url: x.url, datetime: x.datetime || 0 }));
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json({ symbol: sym, items });
  } catch {
    res.status(502).json({ error: "unavailable" });
  }
}
