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

export default async function handler(req, res) {
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${SERIES.join(",")}`, { headers: { "User-Agent": "masonjbennett.com (bennettmasonj@gmail.com)" } });
    if (!r.ok) throw new Error(String(r.status));
    const csv = await r.text();
    const lines = csv.trim().split("\n");
    const header = lines[0].split(",").map(s => s.trim().replace(/"/g, ""));
    const col = {};
    header.forEach((h, i) => { if (SERIES.includes(h)) col[h] = i; });
    const byMonth = new Map(); // ym -> { series -> value } (last non-NaN in the month wins)
    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const date = cells[0];
      if (!date || date.length < 7) continue;
      const ym = date.slice(0, 7);
      if (ym < START) continue;
      const p = byMonth.get(ym) || {};
      for (const s of SERIES) {
        if (col[s] == null) continue;
        const v = parseFloat(cells[col[s]]);
        if (!isNaN(v)) p[s] = Math.round(v * 100) / 100;
      }
      byMonth.set(ym, p);
    }
    const out = {};
    SERIES.forEach(s => { out[s] = []; });
    for (const ym of [...byMonth.keys()].sort()) {
      const p = byMonth.get(ym);
      SERIES.forEach(s => { if (p[s] != null) out[s].push([ym, p[s]]); });
    }
    if (!out.UNRATE.length) throw new Error("empty");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=172800");
    res.status(200).json(out);
  } catch {
    res.status(502).json({ error: "macro history unavailable" });
  }
}
