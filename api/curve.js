// Vercel serverless function: keyless FRED constant-maturity Treasury yields for the
// Curve Time Machine. Fetches every tenor's full daily history in one fredgraph.csv
// call, samples to month-end, and returns a compact monthly curve matrix from 1990.
// FRED sends no CORS headers, so the browser can't fetch it directly. Data: Federal
// Reserve Bank of St. Louis — credit "Source: FRED" wherever rendered.
//
// Tenor keys are minutes-to-maturity, matching the client's TENORS array so the same
// SVG curve renderer draws both the live Rates Page and this historical reel.
const SERIES = [
  ["DGS1MO", 1], ["DGS3MO", 3], ["DGS6MO", 6], ["DGS1", 12], ["DGS2", 24],
  ["DGS3", 36], ["DGS5", 60], ["DGS7", 84], ["DGS10", 120], ["DGS20", 240], ["DGS30", 360],
];
const START = "1990-01";

export default async function handler(req, res) {
  try {
    const ids = SERIES.map(s => s[0]).join(",");
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${ids}`, { headers: { "User-Agent": "masonjbennett.com (bennettmasonj@gmail.com)" } });
    if (!r.ok) throw new Error(String(r.status));
    const csv = await r.text();
    const lines = csv.trim().split("\n");
    const header = lines[0].split(",").map(s => s.trim().replace(/"/g, ""));
    // Map each column to its tenor (minutes); column 0 is the date, unmatched -> null.
    const colTenor = header.map(h => { const s = SERIES.find(x => x[0] === h); return s ? s[1] : null; });
    const byMonth = new Map();
    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const date = cells[0];
      if (!date || date.length < 7) continue;
      const ym = date.slice(0, 7);
      if (ym < START) continue;
      const p = byMonth.get(ym) || {};
      for (let i = 1; i < header.length; i++) {
        const m = colTenor[i];
        if (!m) continue;
        const v = parseFloat(cells[i]);
        if (!isNaN(v)) p[m] = Math.round(v * 100) / 100; // later rows in a month overwrite -> month-end sample
      }
      byMonth.set(ym, p);
    }
    // Keep only months with a real 2Y and 10Y so every frame draws a meaningful curve.
    const out = [];
    for (const [ym, p] of byMonth) if (p[24] != null && p[120] != null) out.push([ym, p]);
    out.sort((a, b) => a[0].localeCompare(b[0]));
    if (!out.length) throw new Error("empty");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=172800");
    res.status(200).json(out);
  } catch {
    res.status(502).json({ error: "curve unavailable" });
  }
}
