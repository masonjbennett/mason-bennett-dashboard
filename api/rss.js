// Vercel serverless function: the Standing Wire backbone. Fetches official
// public RSS feeds from a fixed server-side registry and returns ONLY
// headline + link + timestamp + source attribution (standard syndication use —
// no article bodies are stored or re-served; every headline links out).
const SOURCES = {
  cnbc: { label: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", paywall: false, priority: 2 },
  cnbcmkts: { label: "CNBC Markets", url: "https://www.cnbc.com/id/20910258/device/rss/rss.html", paywall: false, priority: 2 },
  // NOTE: the old feeds.a.dj.com family froze in Jan 2025 — use feeds.content.dowjones.io only
  wsj: { label: "WSJ Markets", url: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain", paywall: true, priority: 1 },
  mw: { label: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", paywall: false, priority: 3 },
  yahoo: { label: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", paywall: false, priority: 4 },
  reuters: { label: "Reuters", url: "https://news.google.com/rss/search?q=site:reuters.com%20business%20when:1d&hl=en-US&gl=US&ceid=US:en", paywall: false, priority: 0 },
  // Newsletters (Substack /feed convention) — excluded from the default wire; fetched by the Reading Ledger.
  netinterest: { label: "Net Interest", url: "https://www.netinterest.co/feed", paywall: false, priority: 9, letter: true },
  thediff: { label: "The Diff", url: "https://www.thediff.co/feed", paywall: false, priority: 9, letter: true },
  transcript: { label: "The Transcript", url: "https://thetranscript.substack.com/feed", paywall: false, priority: 9, letter: true },
  apricitas: { label: "Apricitas Economics", url: "https://www.apricitas.io/feed", paywall: false, priority: 9, letter: true },
};
const UA = "Mozilla/5.0 (compatible; masonjbennett.com wire; bennettmasonj@gmail.com)";

const strip = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#0?39;|&apos;|&#8217;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"')
  .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/\s+/g, " ").trim();

function parseFeed(xml, srcId) {
  const src = SOURCES[srcId];
  const items = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/g)].map(m => {
    const e = m[1];
    const g = re => { const x = e.match(re); return x ? x[1] : ""; };
    let title = strip(g(/<title[^>]*>([\s\S]*?)<\/title>/));
    // Google News appends " - Publication" to titles; drop it for the Reuters lane
    if (srcId === "reuters") title = title.replace(/\s+-\s+Reuters.*$/i, "");
    const link = strip(g(/<link[^>]*>([\s\S]*?)<\/link>/)) || strip(g(/<guid[^>]*>([\s\S]*?)<\/guid>/));
    const pub = g(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const ts = pub ? Date.parse(pub) : 0;
    return { title, link, ts, src: srcId, label: src.label, paywall: src.paywall, priority: src.priority, letter: !!src.letter };
  }).filter(x => x.title && /^https?:\/\//.test(x.link));
  return items.slice(0, 20);
}

export default async function handler(req, res) {
  const defaults = Object.keys(SOURCES).filter(k => !SOURCES[k].letter).join(",");
  const want = [...new Set(String(req.query.src || defaults)
    .split(",").map(s => s.trim()).filter(s => SOURCES[s]))];
  if (!want.length) return res.status(400).json({ error: "no sources" });
  const lists = await Promise.all(want.map(async id => {
    try {
      const r = await fetch(SOURCES[id].url, { headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml, */*" } });
      if (!r.ok) return [];
      return parseFeed(await r.text(), id);
    } catch { return []; }
  }));
  const items = lists.flat();
  if (!items.length) return res.status(502).json({ error: "wire down" });
  // Freshness: 36h for the news wire, 60 days for weekly newsletters
  const now = Date.now();
  const fresh = items.filter(x => x.ts === 0 || x.ts > now - (x.letter ? 60 * 86400000 : 36 * 3600000)).sort((a, b) => b.ts - a.ts).slice(0, 80);
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
  res.status(200).json({ items: fresh, asOf: new Date().toISOString() });
}
