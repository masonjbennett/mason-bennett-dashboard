// Vercel serverless function: proxies Finnhub quotes so visitors get real
// market data without exposing the API key. Set FINNHUB_KEY in Vercel env vars.
export default async function handler(req, res) {
  const raw = String(req.query.symbols || "");
  const symbols = [...new Set(raw.split(",").map(s => s.trim().toUpperCase()).filter(s => /^[A-Z.]{1,10}$/.test(s)))].slice(0, 30);
  const key = process.env.FINNHUB_KEY;
  if (!key) return res.status(503).json({ error: "not configured" });
  if (!symbols.length) return res.status(400).json({ error: "no symbols" });
  const out = {};
  await Promise.all(symbols.map(async s => {
    try {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${key}`);
      const d = await r.json();
      if (d && typeof d.c === "number" && d.c > 0) out[s] = { c: d.c, dp: d.dp ?? 0, h: d.h, l: d.l, o: d.o, pc: d.pc };
    } catch {}
  }));
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  res.status(200).json(out);
}
