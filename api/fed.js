// Vercel serverless: the Fed Ledger. Finds the two most recent FOMC policy STATEMENTS from the
// Federal Reserve's monetary press-release RSS feed, then extracts each statement's body from the
// page using stable TEXT anchors (never CSS classes, which the Fed can change silently). Returns
// both bodies for a client-side word-level redline. FOMC statements are US-government works and are
// public domain (17 U.S.C. §105), so reproducing them verbatim is safe. HIDE-ON-FAILURE: if the
// feed, a fetch, or a sanity check fails for EITHER statement, respond 502/ok:false so the front
// end renders nothing rather than a garbled or stale redline on a recruiter-facing page.
const FEED = "https://www.federalreserve.gov/feeds/press_monetary.xml";
const UA = "masonjbennett.com (bennettmasonj@gmail.com)";
// Cut the body at the FIRST of these (statement structure varies: some releases carry a voting
// roster, some state the vote up front and end before the media line / implementation note).
const END_SENTINELS = ["Voting for the monetary policy action were", "For media inquiries", "Implementation Note issued", "Implementation Note", "Last Update:"];

export function decodeEntities(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, " ");
}
// Strip HTML to plain text, preserving paragraph breaks, and normalize the dashes/quotes the Fed
// uses (non-breaking hyphen U+2011 in "3-1/2", curly apostrophes) so the diff shows no phantom edits.
export function htmlToText(html) {
  let t = html.replace(/\r/g, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  t = t.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h[1-6]|li)\s*>/gi, "\n").replace(/<p[^>]*>/gi, "\n");
  t = t.replace(/<[^>]+>/g, "");
  t = decodeEntities(t);
  t = t.replace(/[‐‑‒–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, " ");
  t = t.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n");
  return t.trim();
}
// Assessment openers — the economic-assessment sentence a classic statement BODY begins with.
// Deliberately excludes "The Committee decided": that phrase also appears mid-body as a new
// sentence, so using it as an opener could anchor deep inside the statement and silently drop the
// lead paragraph. Vote-preamble statements (whose body legitimately starts "The Committee
// decided…") are handled by the preamble branch instead, which is unambiguous.
const OPENERS = [/Recent indicators (suggest|have|point|show)\b/, /Available indicators suggest\b/, /Economic activity has\b/];
export function extractBody(text) {
  let start = -1;
  // 1) Vote-preamble style (June-2026-style): body begins right after "…by a N-0 vote:".
  const preamble = text.match(/approved the following statement for release by a[\s\S]{0,40}?vote:/i);
  if (preamble) start = preamble.index + preamble[0].length;
  // 2) Classic style: body begins at the earliest economic-assessment opener.
  else {
    for (const re of OPENERS) { const m = text.match(re); if (m && (start < 0 || m.index < start)) start = m.index; }
    // 3) Last resort: cut after the dateline. If that leaves page chrome ("Share"), sane() hides it.
    if (start < 0) { const rel = text.match(/For release at\b[^\n]*/i); start = rel ? rel.index + rel[0].length : 0; }
  }
  let body = text.slice(start);
  // END: cut before the first end sentinel that appears.
  let end = body.length;
  for (const s of END_SENTINELS) { const i = body.indexOf(s); if (i >= 0 && i < end) end = i; }
  return body.slice(0, end).trim();
}
export function sane(body) {
  if (!body || body.length < 500 || body.length > 6000) return false;
  if (!/federal funds rate/i.test(body)) return false;
  if ((body.match(/Committee/g) || []).length < 2) return false;
  if (!/2 percent/i.test(body)) return false;
  if (!/target range/i.test(body)) return false;
  if (/For media inquiries|Implementation Note|Last Update:|Voting for the monetary policy action were/i.test(body)) return false;
  if (/^(Release Date|Release Time|For release at|Share|Skip to)/i.test(body)) return false;
  // End-side guard: if every END_SENTINEL vanished in a template change, footer/nav chrome would
  // survive — reject known footer markers, and require the body to end on real sentence punctuation.
  if (/Board of Governors of the Federal Reserve System|Website Policies|Freedom of Information|No FEAR Act|Accessibility|FOIA/i.test(body)) return false;
  if (!/[.)]\s*$/.test(body)) return false;
  return true;
}
const basename = l => (String(l).trim().split("/").pop() || "");
const isoFromLink = l => { const m = basename(l).match(/^monetary(\d{4})(\d{2})(\d{2})a\.htm$/); return m ? `${m[1]}-${m[2]}-${m[3]}` : ""; };

async function fetchStatement(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("page " + r.status);
  const body = extractBody(htmlToText(await r.text()));
  if (!sane(body)) throw new Error("sanity");
  return body;
}

export default async function handler(req, res) {
  try {
    const fr = await fetch(FEED, { headers: { "User-Agent": UA } });
    if (!fr.ok) throw new Error("feed " + fr.status);
    const xml = await fr.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => {
      const g = re => (m[1].match(re) || [, ""])[1].trim();
      return {
        title: decodeEntities(g(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)),
        link: g(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i),
        ts: Date.parse(g(/<pubDate>([\s\S]*?)<\/pubDate>/i)) || 0,
      };
    });
    // Statement items: exact title + the ...a.htm basename (…b.htm is projections/reaffirmation).
    let stmts = items.filter(i => i.title.toLowerCase().trim() === "federal reserve issues fomc statement" && /^monetary\d{8}a\.htm$/.test(basename(i.link)));
    if (stmts.length < 2) stmts = items.filter(i => /fomc statement/i.test(i.title) && !/minutes|projections|reaffirms|longer-run goals/i.test(i.title) && /^monetary\d{8}a\.htm$/.test(basename(i.link)));
    stmts.sort((a, b) => b.ts - a.ts);
    if (stmts.length < 2) throw new Error("need two");
    const [L, P] = stmts;
    const [latest, prior] = await Promise.all([fetchStatement(L.link), fetchStatement(P.link)]);
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=172800");
    res.status(200).json({ ok: true, latest: { date: isoFromLink(L.link), url: L.link, text: latest }, prior: { date: isoFromLink(P.link), url: P.link, text: prior } });
  } catch {
    res.status(502).json({ ok: false });
  }
}
