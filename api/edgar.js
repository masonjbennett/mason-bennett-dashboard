// Vercel serverless function: proxies SEC EDGAR's current-filings Atom feeds
// (public-domain US government data). EDGAR sends no CORS headers and its
// fair-access policy requires a declared User-Agent identifying the requester.
const FORMS = { "8-K": "8-K", "13D": "SC 13D", "S-1": "S-1" };
const UA = "masonjbennett.com bennettmasonj@gmail.com";

const unescapeXml = s => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"');

export default async function handler(req, res) {
  const want = [...new Set(String(req.query.forms || "8-K,13D,S-1").split(",").map(s => s.trim()).filter(f => FORMS[f]))];
  if (!want.length) return res.status(400).json({ error: "no forms" });
  try {
    const lists = await Promise.all(want.map(async f => {
      const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=${encodeURIComponent(FORMS[f])}&company=&dateb=&owner=include&count=20&output=atom`;
      const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip, deflate" } });
      if (!r.ok) return [];
      const xml = await r.text();
      return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => {
        const e = m[1];
        const g = re => { const x = e.match(re); return x ? x[1].trim() : ""; };
        return {
          form: f,
          title: unescapeXml(g(/<title[^>]*>([\s\S]*?)<\/title>/)),
          link: unescapeXml(g(/<link[^>]*href="([^"]*)"/)),
          updated: g(/<updated>([\s\S]*?)<\/updated>/),
        };
      }).filter(x => x.title && x.link);
    }));
    const items = lists.flat().sort((a, b) => (b.updated || "").localeCompare(a.updated || "")).slice(0, 30);
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
    res.status(200).json({ items });
  } catch {
    res.status(502).json({ error: "edgar unavailable" });
  }
}
