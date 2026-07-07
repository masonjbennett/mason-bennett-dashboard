// Vercel serverless function: proxies Yahoo Finance's keyless v8 chart endpoint so
// visitors get daily OHLC history without a key. Yahoo sends no CORS headers and
// wants a browser-ish User-Agent, so the browser can't fetch it directly.
//
// GREY-AREA / NO SLA: this is an unofficial endpoint. Every consumer on the client
// MUST treat history as an enhancement layer with a silent fallback — never a hard
// dependency. We keep request volume trivial (small symbol cap) and cache hard.
const RANGES = new Set(["1mo", "3mo", "6mo", "1y", "2y", "5y"]);
const INTERVALS = new Set(["1d", "1wk"]);

// Server-side downsample cap: enough points for a smooth sparkline, small payload.
const MAX_POINTS = 130;

function downsample(arr, cap) {
  if (arr.length <= cap) return arr;
  const step = arr.length / cap;
  const out = [];
  for (let i = 0; i < cap; i++) out.push(arr[Math.min(arr.length - 1, Math.round(i * step))]);
  return out;
}

export default async function handler(req, res) {
  const raw = String(req.query.symbols || "");
  const symbols = [...new Set(raw.split(",").map(s => s.trim().toUpperCase()).filter(s => /^[A-Z.]{1,10}$/.test(s)))].slice(0, 20);
  const range = RANGES.has(String(req.query.range)) ? String(req.query.range) : "1y";
  const interval = INTERVALS.has(String(req.query.interval)) ? String(req.query.interval) : "1d";
  if (!symbols.length) return res.status(400).json({ error: "no symbols" });

  const out = {};
  await Promise.all(symbols.map(async s => {
    try {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=${range}&interval=${interval}`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; masonjbennett.com/1.0; +bennettmasonj@gmail.com)" } },
      );
      if (!r.ok) return;
      const d = await r.json();
      const result = d?.chart?.result?.[0];
      if (!result) return;
      const meta = result.meta || {};
      const quote = result.indicators?.quote?.[0] || {};
      const adj = result.indicators?.adjclose?.[0]?.adjclose;
      const rawCloses = (adj && adj.length ? adj : quote.close) || [];
      const closes = rawCloses.filter(v => typeof v === "number" && !isNaN(v));
      if (closes.length < 2) return;
      const series = downsample(closes, MAX_POINTS).map(v => Math.round(v * 100) / 100);
      out[s] = {
        c: typeof meta.regularMarketPrice === "number" ? meta.regularMarketPrice : closes[closes.length - 1],
        pc: typeof meta.chartPreviousClose === "number" ? meta.chartPreviousClose : (typeof meta.previousClose === "number" ? meta.previousClose : null),
        hi52: typeof meta.fiftyTwoWeekHigh === "number" ? meta.fiftyTwoWeekHigh : Math.max(...closes),
        lo52: typeof meta.fiftyTwoWeekLow === "number" ? meta.fiftyTwoWeekLow : Math.min(...closes),
        cur: meta.currency || "USD",
        closes: series,
      };
    } catch {}
  }));

  if (!Object.keys(out).length) return res.status(502).json({ error: "history unavailable" });
  // Cache hard: history barely moves intraday and the upstream endpoint is grey-area.
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=21600");
  res.status(200).json(out);
}
