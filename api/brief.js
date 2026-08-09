// Vercel serverless: the briefing desk, and the only writer of the shared briefing store.
//
// Two things move server-side here. (1) The Anthropic key: generation runs in this function using
// ANTHROPIC_KEY from Vercel env, so the key never sits in a browser's localStorage and never has to
// be pasted into a second device. (2) The result: every briefing is written to Vercel Blob under a
// stable per-day pathname, so a briefing generated on the desktop is already on the phone when it
// opens the site — instead of evaporating with the old 60-minute localStorage cache.
//
// AUTH IS MANDATORY, NOT OPTIONAL. masonjbennett.com is a public site; without the shared secret
// anyone could read the store or spend Mason's Anthropic credit poisoning it. Every method checks
// SYNC_SECRET first and nothing else runs until it passes.
//
// ONE STEP PER INVOCATION. A briefing is up to three Anthropic calls — draft, then implications
// automatically, with the fact-check left to a button because it runs its own searches and costs
// about what the draft did. Each is its own POST rather than one long request: every invocation
// stays short, partial results land in the store as they finish (a second device sees the text
// before the rest arrives), and the front end can show real progress. verify and sowhat read the
// text back from the store rather than trusting a client-supplied body, so a caller can't slip its
// own text past the fact-checker. They must stay SEQUENTIAL — both read-modify-write one record.
//
// Env: SYNC_SECRET (required), ANTHROPIC_KEY (required to generate), plus BLOB_READ_WRITE_TOKEN,
// added automatically when the Blob store is created in the Vercel dashboard.
import { get, put } from "@vercel/blob";
import { timingSafeEqual } from "node:crypto";

// The searching draft is the long pole and is far slower than it looks. 120s here produced a bare
// 504 on the first live run; 285s then timed out too, at six searches. The browser chain this
// replaced had no time limit at all, so nothing capped it until the move to serverless. Sit at the
// 300s Hobby ceiling and let DEADLINE_MS fail cleanly before the platform does — a timeout that
// names itself costs the same as a 504 but doesn't send you debugging the wrong thing.
export const config = { maxDuration: 300 };
// Abort with room to spare inside maxDuration. Past the platform limit the invocation is killed
// mid-flight and the client gets a 504 with no explanation; aborting ourselves turns the same
// timeout into a named error that says which step ran long.
const DEADLINE_MS = 285000;

const MODEL = "claude-sonnet-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// allowed_callers:["direct"] is the whole ballgame here, not a tuning knob. On web_search_20260209
// this field DEFAULTS to ["code_execution_20260120"] — dynamic filtering — which means web search
// is not offered to the model as a tool at all, only as a function inside a code sandbox. The model
// then batches several searches into one code block, blows max_uses in a single step, gets
// max_uses_exceeded, and spends the rest of the invocation retrying and explaining that it cannot
// find a standalone web_search. That, not slow searching, is what burned two 285s timeouts and
// ~$1.12: the deadline was a symptom. Direct calls make it one search per use, no sandbox, no
// batching. Five covers the five topics the briefing prompts ask for; the docs put simple factual
// queries at 1-3 and multi-entity research at 10+.
const WEB_SEARCH = { type: "web_search_20260209", name: "web_search", max_uses: 5, allowed_callers: ["direct"] };

// ============ PROMPTS (kept verbatim from the browser-side chain they replace) ============
const SRC_GUIDE = `SOURCE RULES: PRIORITIZE: Reuters, Bloomberg, CNBC, FT, WSJ, AP, MarketWatch, Barron's, Yahoo Finance, SEC.gov. EXCLUDE: partisan outlets, opinion blogs, editorials, social media. Prefer factual reporting over commentary.`;
// The briefing also emits flashcards for the Proofs Tray in the SAME call — no extra API spend.
const CARDS_GUIDE = `\nThen ---CARDS--- then JSON: [{"q":"...","a":"..."}] — 2-3 flashcards drawn ONLY from facts stated in the briefing above. Each q is a specific, checkable question (a level, a print, a deal, a driver); each a is one short factual sentence. No opinions or forecasts.`;
const BRIEF_PROMPTS = {
  morning: `Senior equity research analyst morning briefing. Search latest market news. Cover: 1) Overnight global markets 2) Macro/Fed developments 3) Pre-market sector moves 4) M&A/deals 5) What to watch today.\n${SRC_GUIDE}\nCite sources inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}].${CARDS_GUIDE} Plain paragraphs, no markdown.`,
  close: `Senior equity research analyst close briefing. Search today's results. Cover: 1) Index closes with % 2) Session drivers 3) Stock movers 4) After-hours 5) Tomorrow watch.\n${SRC_GUIDE}\nCite inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}].${CARDS_GUIDE} Plain paragraphs, no markdown.`,
};
const SRC_URLS = { "Reuters": "https://reuters.com", "Bloomberg": "https://bloomberg.com", "CNBC": "https://cnbc.com", "Wall Street Journal": "https://wsj.com", "WSJ": "https://wsj.com", "Financial Times": "https://ft.com", "FT": "https://ft.com", "MarketWatch": "https://marketwatch.com", "AP": "https://apnews.com", "Yahoo Finance": "https://finance.yahoo.com", "Barron's": "https://barrons.com", "Seeking Alpha": "https://seekingalpha.com" };

// ============ STORE ============
// Mason is in DFW, so "today" is Central — a UTC date would roll over at 6/7pm local and split an
// evening close briefing from the morning one the client is showing on the same calendar day.
const todayCT = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const pathFor = (date, type) => `mjb/brief/${date}-${type}.json`;

// useCache:false is REQUIRED here, not a tuning knob. The three steps overwrite the same pathname
// seconds apart, and a cached read can serve a version up to 60s stale — which would have step 2
// fact-checking a briefing that no longer exists, or the phone showing yesterday's text.
async function readRecord(date, type) {
  try {
    const r = await get(pathFor(date, type), { access: "private", useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    const text = await new Response(r.stream).text();
    const rec = JSON.parse(text);
    return rec && typeof rec === "object" ? rec : null;
  } catch { return null; } // no store configured, or nothing written yet — treat as empty
}
// Returns whether the write landed. A failed write must NOT lose the result: the call is already
// paid for, so the handler still returns the briefing and lets the front end say it didn't sync.
async function writeRecord(rec) {
  try {
    await put(pathFor(rec.date, rec.type), JSON.stringify(rec), {
      access: "private", addRandomSuffix: false, allowOverwrite: true,
      contentType: "application/json", cacheControlMaxAge: 60,
    });
    return true;
  } catch (e) { console.error("Blob write failed:", e && e.message); return false; }
}

// ============ AUTH ============
function authed(req) {
  const want = process.env.SYNC_SECRET || "";
  const got = String(req.headers["x-mjb-sync"] || "");
  if (!want || !got) return false;
  const a = Buffer.from(want), b = Buffer.from(got);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return timingSafeEqual(a, b);
}

// ============ ANTHROPIC ============
const delay = ms => new Promise(r => setTimeout(r, ms));
// Plain language, so a failed card can say WHY instead of just "failed".
function errText(e) {
  const m = String((e && e.message) || e || "").toLowerCase();
  // Timeouts first, and deliberately so. Our own timeout message names the model, and the broad
  // /model/ rule below would otherwise rewrite "took too long" into "that model is unavailable —
  // the model ID may be retired", sending anyone reading it to debug a model ID that is fine.
  if (/took too long/.test(m)) return String(e.message);
  if (/credit balance|billing|insufficient|quota/.test(m)) return "the Anthropic account is out of credit";
  if (/invalid x-api-key|authentication|unauthorized|permission/.test(m)) return "the server's Anthropic key was rejected";
  if (/rate|overloaded|too many/.test(m)) return "the API is rate-limited — wait a moment";
  if (/model/.test(m)) return "that model is unavailable — the site's model ID may be retired";
  return (e && e.message) ? String(e.message).slice(0, 120) : "the API call failed";
}
// Logs the whole usage object rather than picking fields out of it: the exact shape of the
// server-tool counters isn't worth guessing at, and what matters is that the real token and search
// numbers land in the Vercel logs so the search caps can be tuned from data instead of estimates.
async function callAnthropic(body, deadline, label) {
  // thinking disabled by default: Sonnet 5 runs adaptive thinking when the field is omitted, which
  // spends the max_tokens budget these prompts need for prose.
  for (let i = 0; i < 3; i++) {
    const left = deadline - Date.now();
    if (left <= 0) throw new Error("the briefing took too long — the desk ran out of time before the model answered");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), left);
    let r;
    try {
      r = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ thinking: { type: "disabled" }, ...body }),
        signal: ctrl.signal,
      });
    } catch (e) {
      if (e && (e.name === "AbortError" || e.name === "TimeoutError")) throw new Error("the briefing took too long — the model was still searching when the desk ran out of time");
      throw e;
    } finally { clearTimeout(timer); }
    if (r.status === 429 || r.status === 529) {
      // Only retry a failure that arrived FAST. A searching call that is rate-limited deep into its
      // loop has already done — and been billed for — every search it made, so retrying it re-buys
      // the whole thing at full price and burns the deadline as well. A quick 429 is the cheap case
      // worth retrying; a slow one means stop and say so.
      const spent = Date.now() - (deadline - DEADLINE_MS);
      if (i < 2 && spent < 30000) { await delay(5000 * (i + 1)); continue; }
      // Say so plainly. Falling through to parse the body here would surface a rate limit as
      // "no content in response", which sends anyone debugging it in the wrong direction.
      throw new Error("rate-limited — too many requests; wait a moment and try again");
    }
    let d = null; try { d = await r.json(); } catch {}
    if (d && d.error) throw new Error(d.error.message || d.error.type || "API error");
    if (!r.ok) throw new Error(`the API answered ${r.status}`);
    if (d && d.usage) console.log(`[brief] ${label} usage ${JSON.stringify(d.usage)}`);
    return d;
  }
  throw new Error("the API call failed");
}
function blocksToText(d, joiner) {
  if (!d || !Array.isArray(d.content)) throw new Error("no content in response");
  const t = d.content.filter(b => b.type === "text").map(b => b.text).join(joiner);
  if (!t.trim()) throw new Error("the model returned an empty briefing");
  return t;
}
const parseArr = s => { try { const t = String(s).trim().replace(/```json|```/g, "").trim(); const m = t.match(/\[[\s\S]*\]/); return JSON.parse(m ? m[0] : t); } catch { return null; } };
const parseObj = s => { try { const t = String(s).trim().replace(/```json|```/g, "").trim(); const m = t.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : t); } catch { return null; } };

// Step 1 — draft the briefing, and split off its sources and Proofs Tray cards.
async function stepBrief(type, deadline) {
  const d = await callAnthropic({
    model: MODEL, max_tokens: 2500, tools: [WEB_SEARCH],
    messages: [{ role: "user", content: BRIEF_PROMPTS[type] }],
  }, deadline, "draft");
  // FAIL CLOSED ON AN UNSEARCHED BRIEFING. When the search tool was unreachable the model wrote a
  // long, well-formed apology instead — and because it mentioned "[Reuters]" while explaining that
  // it could not cite Reuters, the inline-citation fallback below manufactured a source for it, and
  // the whole apology was stored as that day's briefing. A briefing that never searched is not a
  // briefing whatever it cost to draft, so reject it here rather than let it reach the store, the
  // other device, or the Proofs Tray. usage.server_tool_use is the only honest witness to this.
  const searches = (d && d.usage && d.usage.server_tool_use && d.usage.server_tool_use.web_search_requests) || 0;
  if (!searches) throw new Error("the briefing ran without a single web search — refusing to store one written from memory");
  const raw = blocksToText(d, "\n\n");
  let sources = [], cards = [];
  const cardSep = raw.indexOf("---CARDS---");
  const head = cardSep !== -1 ? raw.slice(0, cardSep) : raw;
  if (cardSep !== -1) {
    const parsed = parseArr(raw.slice(cardSep + 11));
    if (Array.isArray(parsed)) cards = parsed.filter(c => c && c.q && c.a).slice(0, 3)
      .map(c => ({ q: String(c.q).trim().slice(0, 220), a: String(c.a).trim().slice(0, 320) }));
  }
  let text = head;
  const sep = head.indexOf("---SOURCES---");
  if (sep !== -1) {
    text = head.slice(0, sep).trim();
    const s = parseArr(head.slice(sep + 13));
    if (Array.isArray(s)) sources = s;
  } else text = head.trim();
  // Fall back to the inline [Reuters] citations when the model skips the sources block.
  if (!sources.length) {
    const m = text.match(/\[([A-Z][A-Za-z\s\.&']+?)\]/g);
    if (m) sources = [...new Set(m.map(x => x.slice(1, -1).trim()))].map(n => ({ name: n, url: SRC_URLS[n] || "#" }));
  }
  if (!text) throw new Error("the model returned an empty briefing");
  return { text, sources, cards, searches };
}
// Step 2 — fact-check the stored briefing against the web.
async function stepVerify(t, deadline) {
  const raw = blocksToText(await callAnthropic({
    model: MODEL, max_tokens: 3000, tools: [WEB_SEARCH],
    messages: [{ role: "user", content: `Fact-check this briefing. Extract factual claims, verify each via web search. Return ONLY JSON: {"summary":{"verified":0,"unverified":0,"discrepancy":0,"total":0,"confidence_pct":0},"claims":[{"claim":"...","status":"verified|unverified|minor_discrepancy","note":"...","source":"..."}]}\n\n"""\n${t}\n"""` }],
  }, deadline, "fact-check"), "");
  const v = parseObj(raw);
  if (!v || !v.summary) throw new Error("the fact-check came back unreadable");
  return v;
}
// Step 3 — the implications layer.
async function stepSoWhat(t, type, deadline) {
  const raw = blocksToText(await callAnthropic({
    model: MODEL, max_tokens: 3000,
    messages: [{ role: "user", content: `Senior strategist: from this ${type} briefing, identify 3-5 most impactful developments. Return ONLY JSON array: [{"headline":"5-8 words","development":"one sentence","why_it_matters":"2-3 sentences","who_affected":"sectors/companies","second_order":"what happens next","takeaway":"one actionable sentence"}]\n\n"""\n${t}\n"""` }],
  }, deadline, "so-what"), "");
  const sw = parseArr(raw);
  if (!Array.isArray(sw) || !sw.length) throw new Error("the implications came back unreadable");
  return sw;
}

// ============ HANDLER ============
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store"); // private, and it changes as the steps land
  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: "briefing sync is not configured on this deployment" });
  if (!authed(req)) return res.status(401).json({ error: "that sync secret was rejected — check it in Settings" });

  const body = parseBody(req);
  const type = String((req.method === "POST" ? body.type : req.query.type) || "");
  if (type !== "morning" && type !== "close") return res.status(400).json({ error: "type must be morning or close" });
  const date = todayCT();

  if (req.method === "GET") {
    const rec = await readRecord(date, type);
    return res.status(200).json({ date, type, found: !!rec, brief: rec });
  }
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "method not allowed" }); }
  if (!process.env.ANTHROPIC_KEY) return res.status(503).json({ error: "the server has no Anthropic key configured" });

  const step = String(body.step || "");
  const deadline = Date.now() + DEADLINE_MS;
  try {
    if (step === "brief") {
      // Returning the stored copy unless forced is what stops two devices double-billing the same
      // briefing: whoever taps Generate second gets the first one's result, not a second bill.
      if (!body.force) {
        const existing = await readRecord(date, type);
        if (existing && existing.text) return res.status(200).json({ ...existing, stored: true, reused: true });
      }
      const rec = { v: 1, date, type, ts: Date.now(), ...(await stepBrief(type, deadline)) };
      return res.status(200).json({ ...rec, stored: await writeRecord(rec) });
    }
    if (step !== "verify" && step !== "sowhat") return res.status(400).json({ error: "step must be brief, verify, or sowhat" });

    const rec = await readRecord(date, type);
    if (!rec || !rec.text) return res.status(409).json({ error: "no briefing stored for today yet — draft it first" });
    if (step === "verify") rec.verify = await stepVerify(rec.text, deadline);
    else rec.soWhat = await stepSoWhat(rec.text, type, deadline);
    rec.ts = Date.now();
    return res.status(200).json({ ...rec, stored: await writeRecord(rec) });
  } catch (e) {
    console.error(`brief ${step} failed:`, e && e.message);
    return res.status(502).json({ error: errText(e) });
  }
}
// Vercel's Node runtime parses a JSON body for us, but be tolerant of a raw string.
function parseBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === "object") return b;
  try { return JSON.parse(b) || {}; } catch { return {}; }
}
