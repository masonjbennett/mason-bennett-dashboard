// Vercel serverless function: keyless FRED macro history for the Name That Regime
// quiz. Fetches a handful of long-history series in one fredgraph.csv call and
// month-end samples them from 1990. FRED sends no CORS headers, so the browser
// can't fetch it directly. Data: Federal Reserve Bank of St. Louis — credit "Source: FRED".
//
// Monthly series (FEDFUNDS, UNRATE) report on the 1st; daily series are sampled to
// the last business day of the month. The mix of these series makes different eras
// unmistakable — the 2020 unemployment spike, the 2008 credit blowout, the 2022 hikes.
const SERIES = ["FEDFUNDS", "UNRATE", "DGS10", "T10Y2Y", "VIXCLS", "BAMLH0A0HYM2"];
const START = "1990-01";
const UA = { "User-Agent": "masonjbennett.com (bennettmasonj@gmail.com)" };

// One series per request: fredgraph.csv returns a ZIP of separate CSVs (not one CSV) when asked
// for MIXED-FREQUENCY series together — monthly FEDFUNDS/UNRATE alongside the daily series — which
// silently produced no rows and 502'd this endpoint. Single-series responses are always CSV.
// Each series is month-end sampled: the last non-NaN observation in a month wins.
async function monthly(id) {
  // cosd pins the start date: per-series requests otherwise honour each series' own default graph
  // window (HY spreads came back with only ~3 years), which would strip the older quiz episodes.
  const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${START}-01`, { headers: UA });
  if (!r.ok) throw new Error(String(r.status));
  const csv = (await r.text()).trim();
  if (!/^(observation_date|DATE)\s*,/i.test(csv)) throw new Error("not csv");
  const byMonth = new Map();
  for (const line of csv.split("\n").slice(1)) {
    const i = line.indexOf(",");
    if (i < 0) continue;
    const date = line.slice(0, i).trim();
    if (date.length < 7) continue;
    const ym = date.slice(0, 7);
    if (ym < START) continue;
    const v = parseFloat(line.slice(i + 1));
    if (!isNaN(v)) byMonth.set(ym, Math.round(v * 100) / 100);
  }
  return [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function handler(req, res) {
  try {
    const results = await Promise.all(SERIES.map(s => monthly(s).then(rows => [s, rows]).catch(() => [s, []])));
    const out = {};
    for (const [s, rows] of results) out[s] = rows;
    if (!out.UNRATE.length) throw new Error("empty");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=172800");
    res.status(200).json(out);
  } catch {
    res.status(502).json({ error: "macro history unavailable" });
  }
}
