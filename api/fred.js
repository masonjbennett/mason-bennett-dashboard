// Vercel serverless function: proxies FRED's keyless fredgraph.csv endpoint for
// allowlisted macro series (yield curve, spreads, CPI, etc.). FRED sends no CORS
// headers, so the browser can't fetch it directly. Data: Federal Reserve Bank of
// St. Louis — credit "Source: FRED" wherever rendered.
const ALLOWED = new Set(["CPIAUCSL", "UNRATE", "FEDFUNDS", "DGS2", "DGS10", "MORTGAGE30US", "BAMLH0A0HYM2", "T10YIE", "T10Y2Y", "SP500", "VIXCLS"]);

export default async function handler(req, res) {
  const ids = [...new Set(String(req.query.id || "").split(",").map(s => s.trim().toUpperCase()).filter(s => ALLOWED.has(s)))].slice(0, 12);
  if (!ids.length) return res.status(400).json({ error: "no series" });
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${ids.join(",")}`, { headers: { "User-Agent": "masonjbennett.com (bennettmasonj@gmail.com)" } });
    if (!r.ok) throw new Error(String(r.status));
    const csv = await r.text();
    const lines = csv.trim().split("\n");
    const header = lines[0].split(",").map(s => s.trim().replace(/"/g, ""));
    const out = {};
    header.slice(1).forEach(h => { out[h] = []; });
    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const date = cells[0];
      header.slice(1).forEach((h, i) => {
        const v = parseFloat(cells[i + 1]);
        if (!isNaN(v)) out[h].push([date, v]);
      });
    }
    // Trim history server-side: clients only need recent observations.
    Object.keys(out).forEach(k => { out[k] = out[k].slice(-420); });
    res.setHeader("Cache-Control", "s-maxage=43200, stale-while-revalidate=86400");
    res.status(200).json(out);
  } catch {
    res.status(502).json({ error: "fred unavailable" });
  }
}
