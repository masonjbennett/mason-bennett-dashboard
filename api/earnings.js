// Vercel serverless function: upcoming earnings for the watchlist, visible to
// every visitor. Finnhub free-tier /calendar/earnings, cached 6 hours.
export default async function handler(req, res) {
  const raw = String(req.query.symbols || "");
  const wanted = new Set(raw.split(",").map(s => s.trim().toUpperCase()).filter(s => /^[A-Z.]{1,10}$/.test(s)));
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(503).json({ error: "not configured" });
  if (!wanted.size) return res.status(400).json({ error: "no symbols" });
  const fmt = d => d.toISOString().slice(0, 10);
  const from = new Date(), to = new Date(Date.now() + 14 * 86400000);
  try {
    const r = await fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${fmt(from)}&to=${fmt(to)}&token=${key}`);
    const d = await r.json();
    const rows = (d.earningsCalendar || [])
      .filter(e => wanted.has((e.symbol || "").toUpperCase()))
      .map(e => ({ symbol: e.symbol, date: e.date, hour: e.hour || "", eps: typeof e.epsEstimate === "number" ? e.epsEstimate : null }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 12);
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=43200");
    res.status(200).json(rows);
  } catch {
    res.status(502).json({ error: "upstream" });
  }
}
