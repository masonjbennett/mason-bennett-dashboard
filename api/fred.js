// Vercel serverless function: proxies FRED's keyless fredgraph.csv endpoint for
// allowlisted macro series (yield curve, spreads, CPI, etc.). FRED sends no CORS
// headers, so the browser can't fetch it directly. Data: Federal Reserve Bank of
// St. Louis — credit "Source: FRED" wherever rendered.
const ALLOWED = new Set(["CPIAUCSL", "UNRATE", "FEDFUNDS", "DGS2", "DGS10", "MORTGAGE30US", "BAMLH0A0HYM2", "T10YIE", "T10Y2Y", "SP500", "VIXCLS"]);
const UA = { "User-Agent": "masonjbennett.com (bennettmasonj@gmail.com)" };

// One series per request. Asking fredgraph.csv for MIXED-FREQUENCY series in a single call
// (e.g. monthly CPIAUCSL + daily DGS10) makes it return a ZIP of separate CSVs instead of one
// CSV — which parsed as text yields no columns and silently emptied the Macro Ledger. A
// single-series response is always CSV, so fetch them individually and merge.
async function fetchSeries(id) {
  const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { headers: UA });
  if (!r.ok) throw new Error(String(r.status));
  const csv = (await r.text()).trim();
  if (!/^(observation_date|DATE)\s*,/i.test(csv)) throw new Error("not csv");   // ZIP or error page
  const rows = [];
  for (const line of csv.split("\n").slice(1)) {
    const i = line.indexOf(",");
    if (i < 0) continue;
    const date = line.slice(0, i).trim(), v = parseFloat(line.slice(i + 1));
    if (date && !isNaN(v)) rows.push([date, v]);                                 // "." = missing, skipped
  }
  return rows.slice(-420);   // clients only need recent observations
}

export default async function handler(req, res) {
  const ids = [...new Set(String(req.query.id || "").split(",").map(s => s.trim().toUpperCase()).filter(s => ALLOWED.has(s)))].slice(0, 12);
  if (!ids.length) return res.status(400).json({ error: "no series" });
  try {
    const results = await Promise.all(ids.map(id => fetchSeries(id).then(rows => [id, rows]).catch(() => [id, null])));
    const out = {};
    for (const [id, rows] of results) if (rows && rows.length) out[id] = rows;
    if (!Object.keys(out).length) throw new Error("empty");   // fail closed rather than 200 {}
    res.setHeader("Cache-Control", "s-maxage=43200, stale-while-revalidate=86400");
    res.status(200).json(out);
  } catch {
    res.status(502).json({ error: "fred unavailable" });
  }
}
