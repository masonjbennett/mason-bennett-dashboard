// Vercel serverless: the briefing desk, and the only writer of the shared briefing store.
//
// Two things move server-side here. (1) The Anthropic key: generation runs in this function using
// ANTHROPIC_KEY from Vercel env, so the key never sits in a browser's localStorage and never has to
// be pasted into a second device. (2) The result: every briefing is written to Vercel Blob under a
// stable per-day pathname, so a briefing generated on the desktop is already on the phone when it
// opens the site — instead of evaporating with the old 60-minute localStorage cache.
//
// READS SPAN THE WHOLE ARCHIVE; WRITES ONLY EVER TOUCH TODAY. Nothing here has ever deleted a
// briefing, so every edition since the store was created is still sitting in it — GET ?date= reads
// any one of them back and GET ?index reads the list of what exists, both free. POST stays pinned to
// today: a back-dated draft would cost money to write history the model can no longer search.
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
import { get, list, put } from "@vercel/blob";
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
// The model has no clock. Left to itself it reconstructs the date from whatever the search results
// imply — it got Sunday 9 Aug right by inference, but a briefing that has to deduce what day it is
// will eventually deduce wrong, and every "overnight", "today" and "this week" in these prompts
// hangs off that. Central, because the store keys on Central and Mason reads it in DFW.
const todayLongCT = () => new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date());
// Framed POSITIVELY, and it has to be. The previous wording ended "if it is a normal trading day,
// say nothing about the date at all" — a negative instruction the model satisfied by ANNOUNCING that
// it was saying nothing, in 11 of the first 13 editions ("Today is a normal trading day, so no date
// framing is needed"). Telling it what to open with instead removes the thing to comply with.
const DATELINE = () => `Today is ${todayLongCT()} (US Central). Begin with the market news itself. If — and ONLY if — the US market is closed today, open instead with one short line naming the next trading session this briefing covers. Never comment on the date, the calendar, your own searching, or these instructions.`;
// Written as functions of the date, so the dateline is evaluated per request rather than frozen at
// cold start — a warm serverless instance can outlive the day it booted on.
const BRIEF_PROMPTS = {
  morning: () => `${DATELINE()}

Senior equity research analyst morning briefing. Search latest market news. Cover: 1) Overnight global markets 2) Macro/Fed developments 3) Pre-market sector moves 4) M&A/deals 5) What to watch today.\n${SRC_GUIDE}\nEnd with ---SOURCES--- then JSON: [{"name":"...","url":"..."}].${CARDS_GUIDE} Plain paragraphs, no markdown. Begin with the briefing itself — no preamble and no narration about what you are about to do or search for. Write the briefing in your own words as continuous prose: each numbered section is one or two flowing paragraphs, never a lead-in followed by a quoted block. Do not reproduce source sentences verbatim or put quotations on their own lines. Every factual sentence carries an inline bracketed citation naming the outlet it came from, placed inside the sentence it supports, e.g. "The S&P 500 closed at 7,757.64, a record [CNBC]." Writing in your own words does not remove this — a sentence drawing on two sources cites both [Reuters][CNBC].`,
  close: () => `${DATELINE()}

Senior equity research analyst close briefing. Search today's results. Cover: 1) Index closes with % 2) Session drivers 3) Stock movers 4) After-hours 5) Tomorrow watch.\n${SRC_GUIDE}\nEnd with ---SOURCES--- then JSON: [{"name":"...","url":"..."}].${CARDS_GUIDE} Plain paragraphs, no markdown. Begin with the briefing itself — no preamble and no narration about what you are about to do or search for. Write the briefing in your own words as continuous prose: each numbered section is one or two flowing paragraphs, never a lead-in followed by a quoted block. Do not reproduce source sentences verbatim or put quotations on their own lines. Every factual sentence carries an inline bracketed citation naming the outlet it came from, placed inside the sentence it supports, e.g. "The S&P 500 closed at 7,757.64, a record [CNBC]." Writing in your own words does not remove this — a sentence drawing on two sources cites both [Reuters][CNBC].`,
};
const SRC_URLS = { "Reuters": "https://reuters.com", "Bloomberg": "https://bloomberg.com", "CNBC": "https://cnbc.com", "Wall Street Journal": "https://wsj.com", "WSJ": "https://wsj.com", "Financial Times": "https://ft.com", "FT": "https://ft.com", "MarketWatch": "https://marketwatch.com", "AP": "https://apnews.com", "Yahoo Finance": "https://finance.yahoo.com", "Barron's": "https://barrons.com", "Seeking Alpha": "https://seekingalpha.com" };

// ============ STORE ============
// Mason is in DFW, so "today" is Central — a UTC date would roll over at 6/7pm local and split an
// evening close briefing from the morning one the client is showing on the same calendar day.
const todayCT = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const pathFor = (date, type) => `mjb/brief/${date}-${type}.json`;
// The one place a caller-supplied string is allowed to become part of a Blob pathname, so it is
// strict rather than merely tidy. The regex alone stops traversal (`../../etc/passwd` never matches);
// the round-trip through Date is what stops 2026-02-31 — a string that passes the regex but names a
// day that never existed. Future dates are refused too: nothing can be stored ahead of today, so a
// request for one is a bug or a probe either way. Returns the clean date, or null to reject.
// Deliberately NO floor date: the index below is the authority on what exists, and a hardcoded
// earliest-edition constant could only ever drift out of agreement with it.
function validDate(s) {
  const t = String(s || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== t) return null;
  return t <= todayCT() ? t : null; // ISO dates compare correctly as strings
}

// Which editions the store actually holds — [{date, types:[...]}], newest first. This is what makes
// the archive walkable: without it the client would have to probe dates blindly and could not tell
// "nothing filed that day" from "a day I haven't guessed yet".
//
// Pure read. No Anthropic call, no cost, nothing written.
//
// Paginated on purpose. Two editions a weekday is ~500 records a year against a 1000-per-page
// default, so this stops working silently in year two if the cursor is ignored. The guard is there
// because a loop that trusts a remote hasMore forever is one bad response away from never returning.
async function listEditions() {
  const byDate = new Map();
  let cursor, pages = 0;
  do {
    const r = await list({ prefix: "mjb/brief/", limit: 1000, cursor });
    for (const b of (r && r.blobs) || []) {
      // Match the pathname this file writes, and ignore anything else that ever lands in the folder.
      const m = /^mjb\/brief\/(\d{4}-\d{2}-\d{2})-(morning|close)\.(json|mp3)$/.exec(b.pathname || "");
      if (!m) continue;
      const e = byDate.get(m[1]) || { date: m[1], types: [], audio: [] };
      // Two separate buckets on purpose. `types` stays exactly what it was — the editions that
      // EXIST — and audio is reported beside it, so a stray mp3 can never invent a day that was
      // never briefed (the entries with no types are dropped below).
      const bucket = m[3] === "json" ? e.types : e.audio;
      if (!bucket.includes(m[2])) bucket.push(m[2]);
      byDate.set(m[1], e);
    }
    cursor = r && r.hasMore ? r.cursor : null;
  } while (cursor && ++pages < 20);
  return [...byDate.values()]
    .map(e => ({ date: e.date, types: ["morning", "close"].filter(t => e.types.includes(t)), audio: ["morning", "close"].filter(t => e.audio.includes(t)) })) // store order isn't edition order
    .filter(e => e.types.length) // an mp3 with no record behind it is not an edition
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

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
// Belt and braces behind the "no preamble" instruction. The first live briefing opened with "I need
// more specific, current data... Let me get the latest Fed/macro news", which was the model
// narrating its plan and which then got stored as the opening line of the day's news. Only strips
// LEADING first-person process narration, and only whole paragraphs — a briefing that legitimately
// begins with a headline or a section number is untouched.
// Three layers of throat-clearing arrive in front of the news and they are NOT the same thing:
//   1. process narration  — "Let me get current, more specific data on today's premarket movers"
//   2. capability chatter — "I have enough information to compile this morning briefing now."
//   3. instruction echo   — "Today is a normal trading day, so no date framing is needed."
// Measured over the first 13 editions: 18 paragraphs, 371 words, ~11 seconds of speech an edition.
// It was survivable on a page you skim. It is not survivable in audio, where it is the first thing
// heard and cannot be skipped past.
//
// PLANNING is no longer anchored with ^. That anchor was the bug: the model routinely states an
// observation FIRST and only then narrates — "The Fed search results are mixing 2025 Jackson Hole
// coverage with this year's. Let me get current data…" — which sailed past a rule that only looked
// at the head of the paragraph.
const PREAMBLE = /(?:^|[.\s])(?:i'?ll|i will|i'?m going to|i need|i have enough|let me|first,? let me|okay[,.]|sure[,.])\b|\bsearch results\b/i;
// The instruction echo, which only ever appears when the market IS open and the model should have
// said nothing. Length-capped so it can only ever match a short opener, never a real paragraph that
// happens to mention an open market.
const DATE_ECHO = /\b(normal (?:us )?(?:trading|market)? ?(?:day|session)|markets? (?:is|are) open)\b/i;
// The one date line DATELINE genuinely asks for. Checked FIRST, so a holiday opener can never be
// mistaken for the echo it superficially resembles — that is the line a reader most needs.
const DATE_WANTED = /\b(closed|shortened|half[- ]day|next trading session|observ)/i;
// Backstop for the same behaviour the prompt now forbids. When the model sets a quotation on its
// own line, the blank lines around it reach the renderer as real paragraph breaks and a sentence
// arrives split across three of them — the citation stranded at the head of the next fragment. A
// paragraph that does not end in terminal punctuation is not a paragraph, so glue it to the one
// after it. Conservative on purpose: it only ever JOINS, so the worst case is prose left as the
// model wrote it, never text lost.
// A paragraph is UNFINISHED if it ends in a comma or dash, or in a word that cannot end a sentence —
// a conjunction, a preposition, an article, or one of the attribution verbs this prose leans on
// ("…[Yahoo Finance]. In fixed income, Edward Jones noted"). That is the real signal, and asking the
// LEFT side of the seam is what the first attempt at this got wrong.
const DANGLING = /(?:^|\s)(?:and|or|but|by|with|to|for|from|as|than|that|the|a|an|in|on|at|of|its|their|his|her|into|over|under|after|before|while|which|who|including|amid|per|via|said|says|noted|notes|added|adds|reported|reports|announced|showed|shows|told|according)$/i;
const endsUnfinished = t => /[,\-—–]$/.test(t) || DANGLING.test(t);
// Or the RIGHT side reads as a continuation: it opens lowercase, on a citation bracket, or on
// punctuation. "…boosting its shares" + ", and" is one sentence in two paragraphs.
const startsContinuation = t => /^[a-z[(,;:—–-]/.test(t);

export function reflow(text) {
  const out = [];
  for (const para of text.split(/\n\s*\n/)) {
    const t = para.trim();
    if (!t) continue;
    const prev = out.length ? out[out.length - 1] : null;
    // Non-terminal alone is NOT enough, and that was the defect. A markets paragraph ends in a
    // figure all the time — "…which also sank more than 8%" — and gluing the next one onto it fused
    // two complete sentences into one unreadable line, twice in the 2026-08-28 edition alone. Now
    // one of the two halves must actually ask to be joined. Measured against the only unreflowed
    // record in the archive: 43 of its 44 joins still happen, and the one that stops is a section
    // heading swallowing the section under it, which was never right either.
    if (prev !== null && !/[.!?:;"”)]$/.test(prev) && (endsUnfinished(prev) || startsContinuation(t))) out[out.length - 1] = prev + " " + t;
    else out.push(t);
  }
  return out.join("\n\n");
}
function isOpeningNoise(p) {
  const t = String(p).trim();
  if (DATE_WANTED.test(t)) return false;
  if (PREAMBLE.test(t)) return true;
  return DATE_ECHO.test(t) && t.split(/\s+/).length <= 45;
}
// Still LEADING-ONLY, and that conservatism is deliberate rather than left over: a briefing may
// legitimately quote someone mid-document, and only the front of the document is where the model
// clears its throat. Verified over the archive — no non-leading paragraph is reachable except the
// ones the loop reaches after dropping the noise in front of them.
export function stripPreamble(text) {
  const paras = text.split(/\n\s*\n/);
  while (paras.length > 1 && isOpeningNoise(paras[0])) paras.shift();
  return paras.join("\n\n").trim();
}
const parseArr = s => { try { const t = String(s).trim().replace(/```json|```/g, "").trim(); const m = t.match(/\[[\s\S]*\]/); return JSON.parse(m ? m[0] : t); } catch { return null; } };
const parseObj = s => { try { const t = String(s).trim().replace(/```json|```/g, "").trim(); const m = t.match(/\{[\s\S]*\}/); return JSON.parse(m ? m[0] : t); } catch { return null; } };

// Step 1 — draft the briefing, and split off its sources and Proofs Tray cards.
async function stepBrief(type, deadline) {
  const d = await callAnthropic({
    model: MODEL, max_tokens: 2500, tools: [WEB_SEARCH],
    messages: [{ role: "user", content: BRIEF_PROMPTS[type]() }],
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
  text = reflow(stripPreamble(text));
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

// ============ AUDIO ============
// The listening edition. The briefings were going unread — not because they were wrong but because
// reading one costs ten minutes at a screen, and a commute or a shift has no screen in it. Audio is
// the format that fits the gap, and it is the same record read a different way, never a second
// briefing.
//
// NOT a new serverless function. api/ sits at Hobby's 12-function cap, which is the same constraint
// that made the archive index a mode of GET rather than a 13th file. Audio is a fourth POST step and
// a flag on GET.
//
// THE SCRIPT IS NOT THE BRIEFING, and that is the whole design problem. The prose is written to be
// READ: every factual sentence carries an inline bracketed citation, which runs about sixteen an
// edition and would arrive as sixteen interruptions inside ten minutes of speech. They come out of
// the spoken body — and the attribution is then RESTORED where audio can carry it, in a sign-off
// naming the outlets. Stripping them and saying nothing would make the spoken edition the one
// artifact on this site that asserts facts from nowhere, which is the Exxon collapsed-table lesson:
// a transformed artifact has to say what it is.
const TTS_URL = "https://api.openai.com/v1/audio/speech";
// Anthropic has no text-to-speech API, so this is the one part of the briefing desk that talks to a
// different vendor. Both are env-overridable so a voice can be changed without touching this file;
// tts-1 is the cheap long-standing model and onyx is the closest thing to a desk voice.
const TTS_MODEL = () => process.env.TTS_MODEL || "tts-1";
const TTS_VOICE = () => process.env.TTS_VOICE || "onyx";
// The endpoint caps input at 4096 characters and a briefing runs about 9,000, so every edition is
// several calls whose audio is joined below. 3800 leaves room for the sentence that straddles the
// boundary rather than trusting the cap exactly.
const TTS_CHUNK = 3800;
const audioPathFor = (date, type) => `mjb/brief/${date}-${type}.mp3`;

// Said aloud, not printed. Deliberately a short list: every entry is a string a speech engine gets
// audibly wrong, and guessing at more of them is how a pronunciation table starts mangling ordinary
// prose. Order matters — the longer patterns run first.
const SAY = [
  [/\bS&P\b/g, "S and P"], [/\bM&A\b/g, "M and A"], [/\bP&L\b/g, "P and L"],
  [/(\d)\s*bps\b/gi, "$1 basis points"], [/\bbps\b/gi, "basis points"],
  [/\by\/y\b/gi, "year over year"],
  [/\bq\/q\b/gi, "quarter over quarter"], [/\bm\/m\b/gi, "month over month"],
  [/\b(\d+)-K\b/g, "$1 K"], [/\b(\d+)-Q\b/g, "$1 Q"],
  [/\bET\b/g, "Eastern"], [/\bCT\b/g, "Central"],
  [/(\d)\s*bn\b/gi, "$1 billion"], [/(\d)\s*mn\b/gi, "$1 million"],
];
// The citation and the whitespace in front of it go together: taking only the bracket out of
// "a record [CNBC]." leaves "a record ." and the engine pauses on the orphaned space.
export function stripCites(s) {
  return String(s == null ? "" : s)
    .replace(/\s*\[[A-Z][^\]]{0,28}\]/g, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
export const say = s => SAY.reduce((t, [re, to]) => t.replace(re, to), stripCites(s)).replace(/[ \t]{2,}/g, " ").trim();
// "Reuters, CNBC and Bloomberg" — spoken lists need the conjunction a rendered list can leave out.
const listWords = a => a.length <= 1 ? (a[0] || "") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;

// The record, read in the order it is written, with the parts audio can't carry left out. The
// So What is nearly half the spoken length and is the best of it — headline, then why, then the
// takeaway is already a spoken shape. The fact-check contributes only its summary and the claims
// that FAILED, for the same reason the card prints those first: reading twenty confirmations aloud
// buries the two that matter.
export function spokenScript(rec) {
  const L = [];
  // Noon UTC is the same calendar day in Central, which is what keeps this off the new Date(iso)
  // rake that prints the day before for every reader west of Greenwich.
  const when = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${rec.date}T12:00:00Z`));
  L.push(`${rec.type === "morning" ? "Morning" : "Closing"} briefing. ${when}.`);
  // stripPreamble again, at READ time, and not as belt-and-braces. It runs at draft time over text
  // that is then frozen — every POST is pinned to todayCT(), so a stored edition never passes through
  // stepBrief a second time and can never be cleaned in place. Audio is made from that stored text,
  // which means without this the reading opens with exactly the throat-clearing the draft-time fix
  // removes: "Morning briefing. Friday, August 28. Friday, August 28, 2026 is a normal US trading
  // day, so today's session proceeds as scheduled." The date twice, the second time as instruction
  // echo. On a page you skim past it; in speech you sit through it before any news.
  //
  // The same function, called in one more place — not a second implementation of the rule.
  for (const p of stripPreamble(String(rec.text || "")).split(/\n\s*\n/)) { const t = say(p); if (t) L.push(t); }
  if (Array.isArray(rec.soWhat) && rec.soWhat.length) {
    L.push("Now, what it means.");
    rec.soWhat.forEach((x, i) => {
      const bits = [
        `Number ${i + 1}. ${x.headline || ""}.`, x.development, x.why_it_matters,
        x.second_order && `What happens next. ${x.second_order}`,
        x.takeaway && `The takeaway. ${x.takeaway}`,
      ].filter(Boolean).join(" ");
      const t = say(bits); if (t) L.push(t);
    });
  }
  if (rec.verify && rec.verify.summary) {
    const s = rec.verify.summary, flagged = (rec.verify.claims || []).filter(c => c && c.status !== "verified");
    if (flagged.length) {
      L.push(`A note on the fact-check. ${s.verified || 0} of ${s.total || 0} claims found a source. ${flagged.length === 1 ? "One did not" : `${flagged.length} did not`}.`);
      // Capped, and the cap is SAID when it bites — a spoken list that silently stops is worse than
      // a short one, because nothing in the audio tells you there was more.
      for (const c of flagged.slice(0, 5)) { const t = say(`${c.claim || ""}${c.note ? `. ${c.note}` : ""}`); if (t) L.push(t); }
      if (flagged.length > 5) L.push(`${flagged.length - 5} further unconfirmed claims are in the written edition.`);
    } else if (s.total) L.push(`The fact-check found a source for all ${s.total} claims.`);
  } else L.push("This edition has not been fact-checked.");
  const names = [...new Set((rec.sources || []).map(s => s && s.name).filter(Boolean))];
  // The citations came out of the body; this is where they go back in. A spoken briefing that never
  // names an outlet is a briefing with no provenance at all.
  L.push(`${names.length ? `Reported by ${listWords(names)}. ` : ""}The written edition, with the sources and every link, is in your briefings folder.`);
  return L.join("\n\n");
}

// Split for the endpoint's input cap, on the largest boundary that fits: paragraphs first, then
// sentences, then — for a single sentence longer than the cap, which no briefing has produced but
// which would otherwise loop forever — a hard cut.
export function chunkScript(text, max) {
  const out = [];
  let cur = "";
  const flush = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; };
  const pushLong = p => {
    let s = "";
    for (const sent of p.match(/[^.!?]+[.!?]*\s*/g) || [p]) {
      if (sent.length > max) { if (s.trim()) { out.push(s.trim()); s = ""; } for (let i = 0; i < sent.length; i += max) out.push(sent.slice(i, i + max).trim()); continue; }
      if ((s + sent).length > max) { if (s.trim()) out.push(s.trim()); s = sent; } else s += sent;
    }
    if (s.trim()) out.push(s.trim());
  };
  for (const para of String(text).split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.length > max) { flush(); pushLong(p); continue; }
    if ((cur ? cur.length + 2 : 0) + p.length > max) flush();
    cur = cur ? `${cur}\n\n${p}` : p;
  }
  flush();
  return out.filter(Boolean);
}

// MP3 is a stream of independent frames, so the chunks concatenate byte-wise and play as one file.
// PCM would join more cleanly still and was rejected on size: ten minutes of 24kHz mono is ~29MB
// against ~3MB of MP3, and this file syncs to a phone over OneDrive every weekday.
//
// An ID3v2 tag is NOT a frame. One at the head of the file is normal and fine; one sitting in the
// MIDDLE of the stream is what makes players report the wrong duration and scrub badly, so every
// chunk after the first has its tag removed.
export function stripID3(buf) {
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    const end = 10 + size;
    if (end < buf.length) return buf.subarray(end);
  }
  return buf;
}
async function ttsChunk(text, deadline) {
  const left = deadline - Date.now();
  if (left <= 0) throw new Error("the audio took too long — the desk ran out of time");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), left);
  let r;
  try {
    r = await fetch(TTS_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_KEY}` },
      body: JSON.stringify({ model: TTS_MODEL(), voice: TTS_VOICE(), input: text, response_format: "mp3" }),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e && (e.name === "AbortError" || e.name === "TimeoutError")) throw new Error("the audio took too long — the voice service was still answering when the desk ran out of time");
    throw e;
  } finally { clearTimeout(timer); }
  if (!r.ok) {
    let msg = "";
    try { const d = await r.json(); msg = (d && d.error && d.error.message) || ""; } catch {}
    // Named, for the same reason every other failure here is: "the voice service answered 401" sends
    // you to the right key instead of to the briefing.
    if (r.status === 401) throw new Error("the server's voice-service key was rejected");
    if (r.status === 429) throw new Error("the voice service is rate-limited — wait a moment and try again");
    throw new Error(msg ? `the voice service said: ${msg.slice(0, 120)}` : `the voice service answered ${r.status}`);
  }
  return Buffer.from(await r.arrayBuffer());
}

// Step 4 — read the stored edition aloud and put the file beside it in the store.
async function stepAudio(rec, deadline) {
  const script = spokenScript(rec);
  if (!script.trim()) throw new Error("there was nothing in this edition to read aloud");
  const chunks = chunkScript(script, TTS_CHUNK);
  const parts = [];
  for (let i = 0; i < chunks.length; i++) {
    const buf = await ttsChunk(chunks[i], deadline);
    parts.push(i === 0 ? buf : stripID3(buf));
  }
  const mp3 = Buffer.concat(parts);
  if (!mp3.length) throw new Error("the voice service returned no audio");
  const path = audioPathFor(rec.date, rec.type);
  await put(path, mp3, {
    access: "private", addRandomSuffix: false, allowOverwrite: true,
    contentType: "audio/mpeg", cacheControlMaxAge: 60,
  });
  console.log(`[brief] audio ${rec.date}-${rec.type} — ${chunks.length} chunks, ${script.length} chars, ${mp3.length} bytes`);
  // What the audio was BUILT FROM, not just that it exists. The so-what and the fact-check land
  // after the draft, so an edition can carry audio that predates half its own content — and the
  // card has to be able to say so rather than offering a stale file as the finished thing.
  return {
    path, bytes: mp3.length, chars: script.length, chunks: chunks.length, ts: Date.now(),
    model: TTS_MODEL(), voice: TTS_VOICE(), hadSoWhat: !!(rec.soWhat && rec.soWhat.length), hadVerify: !!rec.verify,
  };
}

// ============ HANDLER ============
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store"); // private, and it changes as the steps land
  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: "briefing sync is not configured on this deployment" });
  if (!authed(req)) return res.status(401).json({ error: "that sync secret was rejected — check it in Settings" });

  // The archive index — the only route here that isn't about one edition, so it is answered before
  // the type check rather than being made to carry a type it doesn't have.
  if (req.method === "GET" && req.query.index !== undefined) {
    try {
      return res.status(200).json({ today: todayCT(), entries: await listEditions() });
    } catch (e) {
      // Say the index is missing rather than returning an empty one: an empty list is indis-
      // tinguishable from "he has no briefings", and the client would hide the archive as though
      // nothing had ever been filed.
      console.error("brief index failed:", e && e.message);
      return res.status(502).json({ error: "the archive index is unavailable" });
    }
  }

  const body = parseBody(req);
  const type = String((req.method === "POST" ? body.type : req.query.type) || "");
  if (type !== "morning" && type !== "close") return res.status(400).json({ error: "type must be morning or close" });

  // GET reads any day; POST only ever writes TODAY. Generation is deliberately not addressable by
  // date — every draft costs real money, the model can only search the present, and a back-dated
  // request would overwrite the record of a day already read rather than recover it.
  let date = todayCT();
  if (req.method === "GET" && req.query.date !== undefined) {
    date = validDate(req.query.date);
    if (!date) return res.status(400).json({ error: "date must be YYYY-MM-DD, a real day, and not in the future" });
  }

  if (req.method === "GET") {
    const rec = await readRecord(date, type);
    // The audio file itself, back through the same auth as everything else. Deliberately NOT a
    // public blob URL: a public URL is the one thing here that would put an unlisted briefing on the
    // open web, and both callers that want the bytes — the folder sync and the card's player — can
    // send a header. Returns audio/mpeg on success and JSON on every failure, so a caller that gets
    // a 404 can still read why.
    if (req.query.audio !== undefined) {
      if (!rec || !rec.audio || !rec.audio.path) return res.status(404).json({ error: "no audio has been made for that edition" });
      try {
        const a = await get(rec.audio.path, { access: "private", useCache: false });
        if (!a || a.statusCode !== 200 || !a.stream) return res.status(404).json({ error: "the audio is listed on the record but missing from the store" });
        const buf = Buffer.from(await new Response(a.stream).arrayBuffer());
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", String(buf.length));
        return res.status(200).send(buf);
      } catch (e) {
        console.error("brief audio read failed:", e && e.message);
        return res.status(502).json({ error: "the audio file couldn't be read" });
      }
    }
    return res.status(200).json({ date, type, found: !!rec, brief: rec });
  }
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "method not allowed" }); }

  const step = String(body.step || "");
  // Scoped to the steps that actually call Anthropic. Audio talks to the voice service instead, and
  // gating it on a key it never uses would make a working feature 503 on a half-configured deploy.
  if (step !== "audio" && !process.env.ANTHROPIC_KEY) return res.status(503).json({ error: "the server has no Anthropic key configured" });
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
    if (step !== "verify" && step !== "sowhat" && step !== "audio") return res.status(400).json({ error: "step must be brief, verify, sowhat, or audio" });

    const rec = await readRecord(date, type);
    if (!rec || !rec.text) return res.status(409).json({ error: "no briefing stored for today yet — draft it first" });
    if (step === "audio") {
      if (!process.env.OPENAI_KEY) return res.status(503).json({ error: "the server has no voice-service key configured" });
      // The same guard step=brief carries, for the same reason: a reading costs money per character,
      // and two devices opening the card must not both buy it. Regenerate is what sends force.
      if (!body.force && rec.audio && rec.audio.path) return res.status(200).json({ ...rec, stored: true, reused: true });
      rec.audio = await stepAudio(rec, deadline);
    }
    else if (step === "verify") rec.verify = await stepVerify(rec.text, deadline);
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
