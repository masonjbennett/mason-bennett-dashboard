import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ============ CONFIG ============
const TICKERS = [
  { symbol: "SPY", name: "S&P 500" }, { symbol: "QQQ", name: "Nasdaq 100" },
  { symbol: "IWM", name: "Russell 2000" },
  { symbol: "NVDA", name: "NVIDIA" }, { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" }, { symbol: "JPM", name: "JP Morgan" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "TLT", name: "20Y+ Treasury" }, { symbol: "GLD", name: "Gold" },
  { symbol: "UUP", name: "US Dollar" },
];
const HEATMAP = [
  { ticker: "AAPL", sector: "Tech", w: 2 }, { ticker: "NVDA", sector: "Tech", w: 2 },
  { ticker: "MSFT", sector: "Tech", w: 2 }, { ticker: "GOOGL", sector: "Tech", w: 1.5 },
  { ticker: "META", sector: "Tech", w: 1.5 }, { ticker: "JPM", sector: "Fin", w: 1.5 },
  { ticker: "GS", sector: "Fin", w: 1 }, { ticker: "BAC", sector: "Fin", w: 1 },
  { ticker: "AMZN", sector: "Cons", w: 1.5 }, { ticker: "TSLA", sector: "Auto", w: 1.5 },
  { ticker: "XOM", sector: "Energy", w: 1 }, { ticker: "CVX", sector: "Energy", w: 1 },
  { ticker: "UNH", sector: "Health", w: 1.2 }, { ticker: "JNJ", sector: "Health", w: 1 },
  { ticker: "CAT", sector: "Indust", w: 1 }, { ticker: "BA", sector: "Indust", w: 1 },
];
const PORTFOLIO = [
  { ticker: "VOO", name: "Vanguard S&P 500", weight: 30, type: "ETF" },
  { ticker: "QQQ", name: "Nasdaq 100 ETF", weight: 20, type: "ETF" },
  { ticker: "NVDA", name: "NVIDIA Corp.", weight: 15, type: "Equity" },
  { ticker: "AAPL", name: "Apple Inc.", weight: 10, type: "Equity" },
  { ticker: "MSFT", name: "Microsoft", weight: 10, type: "Equity" },
  { ticker: "SCHD", name: "Schwab Dividend ETF", weight: 10, type: "ETF" },
  { ticker: "BTC", name: "Bitcoin", weight: 5, type: "Crypto" },
];
const PROJECTS = [
  { title: "ML Credit Default Classifier", desc: "A machine-learning credit-risk study on a 70,000-loan near-prime dataset that reached 0.9931 ROC-AUC, up from a 0.58 gradient-boosting baseline — through pairwise-interaction features, PCA noise-filtering, pseudo-labelling, and a 60-seed bagged neural-network ensemble with per-fold LightGBM feature selection. I directed the project and reviewed and interpreted the full six-stage workflow; the coding and much of the experimental brainstorming were AI-driven, which the course explicitly encouraged. The write-up documents every stage, ablation, and negative result.", tags: ["Machine Learning", "AI-Directed", "Ensembling & PCA", "Credit Risk"], status: "Completed", completed: "May 2026", url: "/projects/fda2-report.pdf" },
  { title: "Personal Budgeting App", desc: "Full-stack personal finance tool with 11 modules: income & tax estimation (all 50 states, 2026 IRS brackets), 50/30/20 budget builder, expense tracking with CSV import and recurring templates, net worth monitoring, debt payoff planner (avalanche vs snowball), savings goals, investment projector with 401(k) career match calculator, FIRE calculator, and tax optimizer. Month-over-month dashboard with historical navigation.", tags: ["Python", "Streamlit", "Personal Finance", "Tax Planning"], status: "Completed", completed: "Apr 2026", updated: "Apr 12, 2026", img: "/projects/budgeting-app.png", url: "https://github.com/masonjbennett/budgeting-app", demo: "https://masonbennett-budget.streamlit.app/" },
  { title: "Portfolio Analytics App", desc: "Real-time equity portfolio construction and optimization tool with 6 analytical modules. Mean-variance optimization (GMV & Tangency), efficient frontier with CAL, CAPM beta/alpha regression, risk contribution decomposition (PRC), and estimation window sensitivity analysis. Features a tiered tooltip system (Beginner/Intermediate/Advanced) that adapts explanations to the user's knowledge level, custom portfolio builder with live frontier plotting, and CSV/Excel export.", tags: ["Python", "Streamlit", "Portfolio Optimization", "scipy"], status: "Completed", completed: "Apr 2026", updated: "Apr 11, 2026", img: "/projects/portfolio-app.png", url: "https://github.com/masonjbennett/portfolio-app", demo: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { title: "Applied Econometrics — Hurricane Michael", desc: "Regression analysis studying Hurricane Michael's impact on Florida housing prices across 67 counties. Built MLR and Difference-in-Difference models achieving R² of 0.59, identifying a $36,631 median price decline in affected counties. Analyzed median income, unemployment, elevation, FEMA risk indices, and population density as determinants.", tags: ["Stata", "Econometrics", "Regression Analysis", "Diff-in-Diff"], status: "Completed", completed: "Apr 2024", url: "/hurricane-paper.docx" },
];
// Home-page "Featured Work" — a curated, ordered set (not every project with an image).
const FEATURED = [
  { title: "EA $55B Take-Private LBO", note: "Student reconstruction", img: "/projects/ea-featured.png", blurb: "A graduate-course reconstruction of the Electronic Arts take-private — 35-page investment memo, 26-slide IC deck, and a 12-tab LBO model.", tab: "projects", id: "ea-take-private" },
  { title: "Portfolio Analytics App", note: "Live demo", img: "/projects/portfolio-app.png", blurb: "Real-time mean-variance optimization, efficient frontier with CAL, CAPM beta/alpha, and risk-contribution decomposition — built in Streamlit.", tab: "projects" },
];
const DEALS = [
  { id: "ea-take-private", value: "$55B", type: "Take-Private LBO", co: "Electronic Arts Inc.", sub: "NASDAQ: EA", detail: "35-page IM · 26-slide IC deck · 12-tab LBO model", date: "Apr 2026", model: "/deals/ea-lbo-model.xlsx", memo: "/deals/ea-memo.pdf", deck: "/deals/ea-ic-deck.pptx",
    thesis: "Durable live-services cash flow supports an all-cash take-private; returns underwritten primarily to EBITDA growth and deleveraging, not multiple expansion.",
    assumptions: "$36.4B equity / $18.0B debt sources & uses; three-case operating projections spanning 1.27x–2.43x MoM and 4.8%–19.4% gross IRR; reconstruction diverges from reported terms where figures were not public.",
    takeaway: "Returns attribution — separating EBITDA growth, multiple expansion, and deleveraging — tells you more about a deal than the headline IRR." },
  { id: "jagex-lbo", value: "£900M", type: "Sponsor-to-Sponsor LBO", co: "Jagex Limited", sub: "CVC & Haveli ← The Carlyle Group", detail: "10-tab LBO model · 27-page IM · QoE bridge", date: "Apr 2026", model: "/deals/jagex-lbo-model.xlsx", memo: "/deals/jagex-memo.pdf",
    thesis: "Recurring subscription revenue with pricing power justifies a 13.4x FY23 EBITDA entry in a secondary buyout, underwriting a 1.77x MOIC / 12.1% IRR base case.",
    assumptions: "Quality-of-earnings bridge normalizing $56.4M reported to $75M pro-forma EBITDA ($18.6M add-backs); ~10% CAPM-derived WACC; full 2-and-20 fund waterfall; every figure footnoted to primary sources.",
    takeaway: "Cross-border, limited-disclosure deals live or die on quality of earnings — the add-back bridge was the real model." },
  { id: "hca-pitch", value: "NYSE: HCA", type: "Buy · PT $557", co: "HCA Healthcare", sub: "GFI Stock Pitch Competition", detail: "1 of 4 graduate teams · live Q&A defense", date: "Oct 2025",
    thesis: "Buy at $466.58 with a $557.26 one-year target — defensive non-discretionary demand, inflation-resistant hard assets, and disciplined hospital growth in key markets.",
    assumptions: "Three-method valuation: EPS multiple 16x–20x ($428–537), DCF exit multiple 6x–10x ($497–737), DCF Gordon growth ($555–602); comps vs. THC, UHS, CYH; as of Oct 30, 2025.",
    takeaway: "Pitching to practitioners punishes any assumption you can't defend out loud — the Q&A was the real test." },
];
const ARTIFACTS = [
  { label: "Resume (PDF)", href: "/resume.pdf" },
  { label: "EA $55B take-private LBO — student reconstruction", tab: "projects", id: "ea-take-private" },
  { label: "Jagex £900M sponsor-to-sponsor LBO — student reconstruction", tab: "projects", id: "jagex-lbo" },
  { label: "HCA Healthcare stock pitch — GFI competition", tab: "projects", id: "hca-pitch" },
  { label: "ML credit-default classifier — 0.9931 ROC-AUC, project report (PDF)", href: "/projects/fda2-report.pdf" },
  { label: "Applied econometrics — Hurricane Michael housing study (paper)", href: "/hurricane-paper.docx" },
  { label: "Interactive mini-LBO model", tab: "projects", id: "lbo-sandbox" },
  { label: "Interview drill gym — paper LBO, three-statement ripple, debt sweep, redline & more", tab: "projects", id: "puzzle-corner" },
  { label: "The Technicals Desk — original interview question bank", tab: "projects", id: "technicals-desk" },
  { label: "The Lexicon — 300-term original finance dictionary", tab: "markets", id: "lexicon" },
  { label: "Personal budgeting app — live demo", href: "https://masonbennett-budget.streamlit.app/" },
  { label: "Portfolio analytics app — live demo", href: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { label: "Bloomberg Market Concepts certificate (PDF)", href: "/bmc-certificate.pdf" },
  { label: "GitHub", href: "https://github.com/masonjbennett" },
  { label: "Shollmier Investment Fund — Garrison Financial Institute", href: "https://gfi.uark.edu/shollmier-fund.php" },
];
const EXPERIENCE = [
  { role: "M.S. Finance", org: "Walton College of Business", date: "2025–2026", type: "edu", detail: "4.0 GPA · Advanced Financial Modeling, Advanced Corporate Finance, Alternative Investments, New Venture (Private Equity), Financial Data Analytics II" },
  { role: "Analyst, Information Technology Sector — Shollmier Investment Fund", org: "Garrison Financial Institute · Walton College", url: "https://gfi.uark.edu/shollmier-fund.php", date: "Spring 2026", type: "work", detail: "Covered the Information Technology sector for a live $700K+ fixed-income portfolio managed by graduate students." },
  { role: "B.S. Business Administration", org: "Walton College of Business", date: "2021–2024", type: "edu", detail: "3.62 GPA · Business Economics · Dean's List (5 semesters)" },
  { role: "Finance & Economics Tutor", org: "Self-employed · Fayetteville, AR", date: "2021–2024", type: "work", detail: "10+ students/semester. Tailored study guides. Helped improve grades 1–2 letters." },
  { role: "Event Manager", org: "Venue on Spring Creek · TX", date: "2016–2020", type: "work", detail: "100+ guest events. Coordinated vendors, supervised staff. 95%+ satisfaction." },
  { role: "Bartender & Server", org: "Service industry · TX, OK & AR", date: "2016–2025", type: "work", detail: "Worked service-industry jobs to save for and self-fund undergraduate and graduate studies." },
];
const READING = [
  { title: "Damodaran on Valuation", author: "Aswath Damodaran", s: "Reading", note: "Every story has to reconcile to a number eventually." },
  { title: "The Intelligent Investor", author: "Benjamin Graham", s: "Done", note: "Mr. Market is a counterparty, not a guide." },
  { title: "Investment Valuation", author: "Aswath Damodaran", s: "Done", note: "The reference shelf — where I sanity-check assumptions." },
  { title: "Barbarians at the Gate", author: "Burrough & Helyar", s: "Done", note: "Deal fever is a risk factor. Model it." },
  { title: "Options, Futures & Derivatives", author: "John Hull", s: "Ref", note: "Draw the payoff diagram before touching the Greeks." },
  { title: "Financial Modeling & Valuation", author: "Paul Pignataro", s: "Reading", note: "A model you can't audit is a model you can't trust." },
];
const LINKS = [
  { label: "LinkedIn", url: "https://linkedin.com/in/bennettmason", ic: "in" },
  { label: "GitHub", url: "https://github.com/masonjbennett", ic: "gh" },
  { label: "Resume", url: "/resume.pdf", ic: "cv" },
  { label: "Email", url: "mailto:bennettmasonj@gmail.com", ic: "@" },
];
const SRC_GUIDE = `SOURCE RULES: PRIORITIZE: Reuters, Bloomberg, CNBC, FT, WSJ, AP, MarketWatch, Barron's, Yahoo Finance, SEC.gov. EXCLUDE: partisan outlets, opinion blogs, editorials, social media. Prefer factual reporting over commentary.`;
const QLINKS = [
  { n: "Bloomberg", u: "https://bloomberg.com" }, { n: "Reuters", u: "https://reuters.com" },
  { n: "WSJ", u: "https://wsj.com" }, { n: "FT", u: "https://ft.com" },
  { n: "CNBC", u: "https://cnbc.com" }, { n: "Yahoo Finance", u: "https://finance.yahoo.com" },
  { n: "FRED", u: "https://fred.stlouisfed.org" }, { n: "EDGAR", u: "https://sec.gov/edgar" },
  { n: "Finviz", u: "https://finviz.com" }, { n: "TradingView", u: "https://tradingview.com" },
  { n: "PitchBook", u: "https://pitchbook.com" },
];
const SRC_URLS = { "Reuters": "https://reuters.com", "Bloomberg": "https://bloomberg.com", "CNBC": "https://cnbc.com", "Wall Street Journal": "https://wsj.com", "WSJ": "https://wsj.com", "Financial Times": "https://ft.com", "FT": "https://ft.com", "MarketWatch": "https://marketwatch.com", "AP": "https://apnews.com", "Yahoo Finance": "https://finance.yahoo.com", "Barron's": "https://barrons.com", "Seeking Alpha": "https://seekingalpha.com" };

// ============ API ============
function apiHeaders(key) { return { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }; }
function extractText(d) { if (d.error) { console.error("API error:", d.error); return null; } if (!d.content) { console.error("No content in response:", d); return null; } return d.content.filter(b => b.type === "text").map(b => b.text).join("").replace(/```json|```/g, "").trim(); }
function extractTextMulti(d) { if (d.error) { console.error("API error:", d.error); return null; } if (!d.content) { console.error("No content in response:", d); return null; } return d.content.filter(b => b.type === "text").map(b => b.text).join("\n\n"); }
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

// Global queue — ensures only ONE API call at a time with mandatory spacing
const apiQueue = { running: false, queue: [] };
function enqueueAPI(fn) {
  return new Promise((resolve) => {
    apiQueue.queue.push(async () => { const r = await fn(); resolve(r); });
    processQueue();
  });
}
async function processQueue() {
  if (apiQueue.running || apiQueue.queue.length === 0) return;
  apiQueue.running = true;
  while (apiQueue.queue.length > 0) {
    const task = apiQueue.queue.shift();
    await task();
    if (apiQueue.queue.length > 0) await delay(3000); // 3s gap between calls
  }
  apiQueue.running = false;
}

async function callAPI(key, body) {
  return enqueueAPI(async () => {
    for (let i = 0; i < 3; i++) {
      // thinking disabled by default: Sonnet 5 runs adaptive thinking when the field is omitted,
      // which spends the max_tokens budget (some calls are only 300-400) — a body may override.
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: apiHeaders(key), body: JSON.stringify({ thinking: { type: "disabled" }, ...body }) });
      if (r.status === 429 || r.status === 529) {
        const wait = 10000 * (i + 1); // 10s, 20s, 30s
        console.warn(`Rate limited (${r.status}), retrying in ${wait/1000}s... (attempt ${i+1}/3)`);
        await delay(wait);
        continue;
      }
      return r.json();
    }
    console.error("API failed after all retries");
    return { error: { type: "rate_limit", message: "Too many requests — please wait and try again" } };
  });
}

// Cache helpers
function cacheGet(key, maxAgeMin = 30) { try { const c = JSON.parse(localStorage.getItem(key)); if (c && Date.now() - c.ts < maxAgeMin * 60000) return c.data; } catch {} return null; }
function cacheSet(key, data) { try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {} }

async function fetchBriefing(type, key, forceRefresh = false) {
  const p = { morning: `Senior equity research analyst morning briefing. Search latest market news. Cover: 1) Overnight global markets 2) Macro/Fed developments 3) Pre-market sector moves 4) M&A/deals 5) What to watch today.\n${SRC_GUIDE}\nCite sources inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}]. Plain paragraphs, no markdown.`, close: `Senior equity research analyst close briefing. Search today's results. Cover: 1) Index closes with % 2) Session drivers 3) Stock movers 4) After-hours 5) Tomorrow watch.\n${SRC_GUIDE}\nCite inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}]. Plain paragraphs, no markdown.` };
  if (!key) return null;
  if (!forceRefresh) { const cached = cacheGet(`mb_brief_${type}`, 60); if (cached) return cached; }
  try { const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 4000, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }], messages: [{ role: "user", content: p[type] }] }); const raw = extractTextMulti(d); if (!raw) return null; let text = raw, sources = []; const sep = raw.indexOf("---SOURCES---"); if (sep !== -1) { text = raw.slice(0, sep).trim(); try { const srcRaw = raw.slice(sep + 13).trim().replace(/```json|```/g, "").trim(); const srcMatch = srcRaw.match(/\[[\s\S]*\]/); sources = JSON.parse(srcMatch ? srcMatch[0] : srcRaw); } catch {} } if (!sources.length) { const m = text.match(/\[([A-Z][A-Za-z\s\.&']+?)\]/g); if (m) sources = [...new Set(m.map(x => x.slice(1, -1).trim()))].map(n => ({ name: n, url: SRC_URLS[n] || "#" })); } const result = { text, sources }; cacheSet(`mb_brief_${type}`, result); return result; } catch (e) { console.error("Briefing error:", e); return null; }
}
async function verifyBriefing(t, key) {
  if (!key) return null;
  try { const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 3000, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }], messages: [{ role: "user", content: `Fact-check this briefing. Extract factual claims, verify each via web search. Return ONLY JSON: {"summary":{"verified":0,"unverified":0,"discrepancy":0,"total":0,"confidence_pct":0},"claims":[{"claim":"...","status":"verified|unverified|minor_discrepancy","note":"...","source":"..."}]}\n\n"""\n${t}\n"""` }] }); const raw = extractText(d); if (!raw) return null; const match = raw.match(/\{[\s\S]*\}/); if (match) return JSON.parse(match[0]); return JSON.parse(raw); } catch (e) { console.error("Verify error:", e); return null; }
}
async function fetchSoWhat(t, type, key) {
  if (!key) return null;
  try { const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 3000, messages: [{ role: "user", content: `Senior strategist: from this ${type} briefing, identify 3-5 most impactful developments. Return ONLY JSON array: [{"headline":"5-8 words","development":"one sentence","why_it_matters":"2-3 sentences","who_affected":"sectors/companies","second_order":"what happens next","takeaway":"one actionable sentence"}]\n\n"""\n${t}\n"""` }] }); const raw = extractText(d); if (!raw) return null; const match = raw.match(/\[[\s\S]*\]/); if (match) return JSON.parse(match[0]); return JSON.parse(raw); } catch (e) { console.error("SoWhat error:", e); return null; }
}
async function fetchRegime(key) {
  if (!key) return null;
  const cached = cacheGet("mb_regime", 15);
  if (cached) return cached;
  try {
    const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 1000, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: `Search for the current VIX index level, CNN Fear and Greed Index score, and US 10-year Treasury yield.

Then return ONLY a raw JSON object with no other text, no markdown, no backticks:
{"vix":{"level":20.5,"change":-0.3},"fear_greed":{"score":45,"label":"Neutral"},"ten_year":{"yield":4.25,"change":0.02},"regime":"Neutral","summary":"Markets trading cautiously amid mixed signals."}

Replace the example values with the real current data you found. The regime field should be "Risk-On" if VIX < 16 and Fear/Greed > 55, "Risk-Off" if VIX > 25 or Fear/Greed < 30, otherwise "Neutral". Return ONLY the JSON.` }] });
    const raw = extractText(d);
    if (!raw) return null;
    const match = raw.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : JSON.parse(raw);
    if (result) cacheSet("mb_regime", result);
    return result;
  } catch (e) { console.error("Regime error:", e); return null; }
}
async function fetchEarnings(key) {
  if (!key) return null;
  const cached = cacheGet("mb_earnings", 60);
  if (cached) return cached;
  try {
    const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 1000, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: `Search for upcoming earnings reports this week and next week for major US companies. Return ONLY a raw JSON array with no other text, no markdown, no backticks. 8-10 most notable companies:
[{"company":"Apple Inc.","ticker":"AAPL","date":"Apr 24","time":"AMC","est_eps":"$1.62"}]
Replace with real upcoming earnings data. time should be "BMO" for before market open or "AMC" for after market close. Return ONLY the JSON array.` }] });
    const raw = extractText(d);
    if (!raw) return null;
    const match = raw.match(/\[[\s\S]*\]/);
    const result = match ? JSON.parse(match[0]) : JSON.parse(raw);
    if (result) cacheSet("mb_earnings", result);
    return result;
  } catch (e) { console.error("Earnings error:", e); return null; }
}

// ============ HOOKS ============
function usePrices(tickers, finnhubKey) {
  const [p, setP] = useState(() => tickers.map(t => ({ ...t, price: "—", change: "0.00", loading: true })));
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!finnhubKey || fetchedRef.current) return;
    fetchedRef.current = true;
    // Check cache first
    const cached = cacheGet("mb_prices", 5);
    if (cached) { setP(cached); return; }
    // Fetch real quotes from Finnhub
    async function load() {
      const results = [...p];
      for (let i = 0; i < tickers.length; i++) {
        try {
          const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${tickers[i].symbol}&token=${finnhubKey}`);
          const d = await r.json();
          if (d.c) results[i] = { ...tickers[i], price: d.c.toFixed(2), change: d.dp ? d.dp.toFixed(2) : "0.00", h: d.h, l: d.l, pc: d.pc, loading: false };
        } catch {}
        if (i < tickers.length - 1) await delay(120); // Rate limit: ~60/min
      }
      setP(results);
      cacheSet("mb_prices", results);
    }
    load();
    // Refresh every 60s during market hours
    const iv = setInterval(() => { fetchedRef.current = false; }, 60000);
    return () => clearInterval(iv);
  }, [finnhubKey]);
  // Fallback: server-side proxy (real data, key stays on Vercel), then simulated
  const [live, setLive] = useState(false);
  const [asOf, setAsOf] = useState(null);
  const stamp = () => setAsOf(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  useEffect(() => {
    if (finnhubKey) return;
    let cancelled = false, iv = null;
    const startSim = () => {
      if (cancelled) return;
      setP(tickers.map(t => ({ ...t, price: (80 + Math.random() * 450).toFixed(2), change: (Math.random() * 7 - 3.5).toFixed(2) })));
      iv = setInterval(() => setP(prev => prev.map(t => { const d = (Math.random() - 0.47) * 1.8; return { ...t, price: Math.max(1, parseFloat(t.price) + d).toFixed(2), change: (parseFloat(t.change) + d * 0.08).toFixed(2) }; })), 3000);
    };
    (async () => {
      try {
        const cached = cacheGet("mb_prices_proxy", 5);
        if (cached) { if (!cancelled) { setP(cached); setLive(true); stamp(); } return; }
        const r = await fetch(`/api/quotes?symbols=${tickers.map(t => t.symbol).join(",")}`);
        if (!r.ok) throw 0;
        const d = await r.json();
        const mapped = tickers.map(t => d[t.symbol] && d[t.symbol].c ? { ...t, price: d[t.symbol].c.toFixed(2), change: (d[t.symbol].dp || 0).toFixed(2), h: d[t.symbol].h, l: d[t.symbol].l, pc: d[t.symbol].pc } : null);
        if (mapped.filter(Boolean).length < tickers.length / 2) throw 0;
        const filled = mapped.map((m, i) => m || { ...tickers[i], price: "—", change: "0.00" });
        if (!cancelled) { setP(filled); setLive(true); stamp(); cacheSet("mb_prices_proxy", filled); }
      } catch { startSim(); }
    })();
    return () => { cancelled = true; if (iv) clearInterval(iv); };
  }, [finnhubKey]);
  return { prices: p, live: !!finnhubKey || live, asOf };
}

// Yahoo daily-close history for sparklines + 52-week strips. GREY-AREA upstream:
// pure enhancement layer — silent fallback to the day-range bar when unavailable
// (local dev has no proxy, so this stays null and the watchlist shows RangeBars).
function useHistory(symbols, range = "1y") {
  const [data, setData] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const key = `mjb_hist_${range}_${symbols.replace(/[^A-Z.]/g, "")}`;
        const cached = cacheGet(key, 180);
        if (cached) { if (on) setData(cached); return; }
        const r = await fetch(`/api/history?symbols=${symbols}&range=${range}`);
        if (!r.ok) throw 0;
        const d = await r.json();
        if (d && !d.error && on) { setData(d); cacheSet(key, d); }
      } catch {}
    })();
    return () => { on = false; };
  }, [symbols, range]);
  return data;
}

// Engraved day-range bar: low -> high with a teal tick at the current price
const RangeBar = ({ h, l, c }) => {
  if (!(h > l) || !(c > 0)) return <span style={{ width: 56 }} />;
  const p = Math.max(0, Math.min(100, ((c - l) / (h - l)) * 100));
  return <span style={{ display: "inline-flex", alignItems: "center", width: 56, flexShrink: 0 }} title={`Day range ${l.toFixed(2)} – ${h.toFixed(2)}`}>
    <span style={{ position: "relative", width: "100%", height: 1, background: "#d8c8b0", display: "block" }}>
      <span style={{ position: "absolute", left: 0, top: -3, width: 1, height: 7, background: "#b8ab97" }} />
      <span style={{ position: "absolute", right: 0, top: -3, width: 1, height: 7, background: "#b8ab97" }} />
      <span style={{ position: "absolute", left: `calc(${p}% - 1.5px)`, top: -4, width: 3, height: 9, background: "#0d6d56", borderRadius: 1 }} />
    </span>
  </span>;
};

// One-year close sparkline scaled to the 52-week range: the line shows the trend and
// its vertical position shows where price sits in its 52-wk band (the faint rules are
// the 52-wk high/low). Teal if up over the year, claret-red if down.
const Sparkline = ({ closes, hi52, lo52 }) => {
  if (!closes || closes.length < 2) return null;
  const W = 66, H = 20, PAD = 2;
  const lo = Math.min(typeof lo52 === "number" ? lo52 : Infinity, ...closes);
  const hi = Math.max(typeof hi52 === "number" ? hi52 : -Infinity, ...closes);
  const span = hi - lo || 1;
  const px = i => PAD + (i / (closes.length - 1)) * (W - PAD * 2);
  const py = v => PAD + (1 - (v - lo) / span) * (H - PAD * 2);
  const last = closes[closes.length - 1];
  const up = last >= closes[0];
  const col = up ? "#0d6d56" : "#b2342b";
  const dPath = closes.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const pos = Math.round(((last - lo) / span) * 100);
  return <span style={{ display: "inline-flex", alignItems: "center", width: W, flexShrink: 0 }} title={`52-wk ${lo.toFixed(2)} – ${hi.toFixed(2)} · at ${pos}% of range · 1-yr ${up ? "up" : "down"}`}>
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <line x1={PAD} x2={W - PAD} y1={py(hi).toFixed(1)} y2={py(hi).toFixed(1)} stroke="#e9ddc9" strokeWidth="0.6" />
      <line x1={PAD} x2={W - PAD} y1={py(lo).toFixed(1)} y2={py(lo).toFixed(1)} stroke="#e9ddc9" strokeWidth="0.6" />
      <path d={dPath} fill="none" stroke={col} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(closes.length - 1).toFixed(1)} cy={py(last).toFixed(1)} r="1.6" fill={col} />
    </svg>
  </span>;
};

// ============ INFO TOOLTIP ============
function Info({ text, link, linkLabel }) {
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  const enter = () => { clearTimeout(timer.current); setShow(true); };
  const leave = () => { timer.current = setTimeout(() => setShow(false), 400); };
  return <span style={{ position: "relative", display: "inline-flex", marginLeft: 6 }} onMouseEnter={enter} onMouseLeave={leave}>
    <span style={{ width: 15, height: 15, borderRadius: 8, background: show ? "rgba(13,109,86,0.15)" : "rgba(111,103,92,0.1)", border: `1px solid ${show ? "rgba(13,109,86,0.3)" : "rgba(111,103,92,0.2)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: show ? "#0d6d56" : "#8a8072", cursor: "help", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, transition: "all 0.2s" }}>?</span>
    {show && createPortal(<div onMouseEnter={enter} onMouseLeave={leave} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fffdf9", border: "1px solid #e3d5bf", borderRadius: 12, padding: "14px 18px", fontSize: 11, color: "#4a443c", lineHeight: 1.7, width: 300, maxHeight: "70vh", overflowY: "auto", zIndex: 200, boxShadow: "0 12px 40px rgba(64,52,32,0.14), 0 0 0 1px rgba(13,109,86,0.05)", fontFamily: "'Space Grotesk',sans-serif", textTransform: "none", letterSpacing: 0, fontWeight: 400, animation: "fadeIn 0.15s ease", cursor: "default" }}>{text}{link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 10, color: "#0d6d56", textDecoration: "none", fontFamily: "'JetBrains Mono',monospace", padding: "4px 10px", borderRadius: 6, background: "rgba(13,109,86,0.06)", border: "1px solid rgba(13,109,86,0.15)", transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(13,109,86,0.12)";e.currentTarget.style.borderColor="rgba(13,109,86,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(13,109,86,0.06)";e.currentTarget.style.borderColor="rgba(13,109,86,0.15)"}}>{linkLabel || "Learn more"} ↗</a>}</div>, document.body)}
  </span>;
}

// ============ COPY EMAIL ============
const EMAIL = "bennettmasonj@gmail.com";
function CopyEmail({ style }) {
  const [copied, setCopied] = useState(false);
  return <a href={`mailto:${EMAIL}`} onClick={() => { try { navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }} style={style} title="Click to copy">{copied ? "✓ Copied to clipboard" : EMAIL}</a>;
}

// ============ COPY ANCHOR ============
function CopyAnchor({ tab, id }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { try { navigator.clipboard.writeText(`https://masonjbennett.com/${tab}#${id}`); setOk(true); setTimeout(() => setOk(false), 1600); } catch {} }} title="Copy a direct link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 8, color: ok ? "#0d6d56" : "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: 0, textTransform: "uppercase" }}>{ok ? "✓ link copied" : "§ copy link"}</button>;
}

// ============ VISUAL PRIMITIVES ============
const SunIc = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" /></svg>;
const MoonIc = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></svg>;
const GearIc = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" /></svg>;
function MktBadge() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(iv); }, []);
  const h = now.getHours(), m = now.getMinutes(), d = now.getDay(), wd = d > 0 && d < 6;
  const open = wd && ((h === 9 && m >= 30) || (h > 9 && h < 16));
  const pre = wd && h >= 4 && (h < 9 || (h === 9 && m < 30)), after = wd && h >= 16 && h < 20;
  const label = open ? "MARKET OPEN" : pre ? "PRE-MARKET" : after ? "AFTER HOURS" : "MARKET CLOSED";
  const c = open ? "#0d6d56" : pre || after ? "#b0741e" : "#b2342b";
  return <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: c, letterSpacing: 1.5, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: c, animation: open ? "pulse 2s infinite" : "none" }} />{label}</span>;
}
function ScrollRule() {
  const [p, setP] = useState(0);
  useEffect(() => { const on = () => { const h = document.documentElement; setP(h.scrollHeight > h.clientHeight ? (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 : 0); }; window.addEventListener("scroll", on, { passive: true }); on(); return () => window.removeEventListener("scroll", on); }, []);
  return <div style={{ position: "absolute", left: 0, right: 0, bottom: -2, height: 2, background: "#ece1cd" }}><div style={{ width: `${p}%`, height: "100%", background: "linear-gradient(90deg,#0d6d56,#1f5a9e)", transition: "width 0.1s linear" }} /></div>;
}
function Reveal({ children }) {
  const ref = useRef(null);
  const [inV, setInV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el || !("IntersectionObserver" in window)) { setInV(true); return; } const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInV(true); ob.disconnect(); } }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }); ob.observe(el); const failsafe = setTimeout(() => setInV(true), 2600); return () => { ob.disconnect(); clearTimeout(failsafe); }; }, []);
  return <div ref={ref} style={{ opacity: inV ? 1 : 0, transform: inV ? "none" : "translateY(18px)", transition: "all 0.7s cubic-bezier(0.4,0,0.2,1)" }}>{children}</div>;
}
const Kicker = ({ n, t }) => <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase" }}>{n} · {t}</span><div style={{ width: 54, borderTop: "1px solid rgba(13,109,86,0.35)" }} /></div>;
const Orn = () => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "24px 0" }}><div style={{ width: 60, borderTop: "1px solid #ddcfb8" }} /><span style={{ color: "#0d6d56", fontSize: 8 }}>◆</span><div style={{ width: 60, borderTop: "1px solid #ddcfb8" }} /></div>;
const Slug = ({ icon = "#0d6d56", children, right }) => <div style={{ position: "relative", borderTop: "1px solid #ddcfb8", paddingTop: 13, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
  <span style={{ position: "absolute", top: -2, left: 0, width: 32, height: 3, background: icon }} />
  <span style={{ fontSize: 11, fontWeight: 600, color: "#6f675c", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2 }}>{children}</span>
  {right || null}
</div>;
const SourceLine = ({ children }) => <div style={{ fontSize: 8.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, marginTop: 12, borderTop: "1px solid #efe4d2", paddingTop: 8 }}>{children}</div>;
const CloudIc = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .9-8.91 6 6 0 0 0-11.66 1.4A4 4 0 0 0 7 19Z" /></svg>;
const StormIc = ({ size = 13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 16a4.5 4.5 0 0 0 .9-8.91 6 6 0 0 0-11.66 1.4A4 4 0 0 0 7 16Z" /><path d="M12.5 16 10 20h3l-2 4" /></svg>;
function WeatherEar({ prices }) {
  const spy = prices.find(p => p.symbol === "SPY");
  const chg = spy ? parseFloat(spy.change) : NaN;
  if (!(chg === chg)) return null;
  const adv = prices.filter(p => parseFloat(p.change) > 0).length / (prices.length || 1);
  const heavy = Math.abs(chg) >= 2;
  const [Icon, label] = heavy && chg < 0 ? [StormIc, "Heavy weather"]
    : chg <= -0.75 || adv <= 0.35 ? [StormIc, "Stormy tape"]
    : chg >= 0.75 && adv >= 0.6 ? [SunIc, "Fair skies"]
    : [CloudIc, "Partly sunny"];
  return <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 1 }} title="Market weather — S&P 500 move and market breadth">
    <span style={{ color: "#b0741e", display: "inline-flex" }}><Icon /></span>
    {label} · S&P {chg >= 0 ? "+" : "−"}{Math.abs(chg).toFixed(2)}%
  </div>;
}
function MacroTape() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const cached = cacheGet("mb_macro", 5);
        if (cached) { if (!c) setRows(cached); return; }
        const r = await fetch("/api/quotes?symbols=SPY,QQQ,VIXY,UUP,GLD,USO,IBIT");
        if (!r.ok) return;
        const d = await r.json();
        const L = [["SPY", "S&P"], ["QQQ", "NASDAQ"], ["VIXY", "VIX·PROXY"], ["UUP", "DOLLAR"], ["GLD", "GOLD"], ["USO", "OIL"], ["IBIT", "BITCOIN"]];
        const out = L.filter(([s]) => d[s]).map(([s, label]) => ({ s, label, c: d[s].c, dp: d[s].dp }));
        if (out.length && !c) { setRows(out); cacheSet("mb_macro", out); }
      } catch {}
    })();
    return () => { c = true; };
  }, []);
  if (!rows) return null;
  return <div style={{ borderTop: "3px double #33302c", borderBottom: "1px solid #ddcfb8", padding: "9px 2px", marginBottom: 22, display: "flex", flexWrap: "wrap", gap: "6px 24px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, animation: "fadeUp 0.5s ease both" }}>
    {rows.map(r => <span key={r.s} style={{ display: "inline-flex", gap: 7, alignItems: "baseline" }}>
      <span style={{ color: "#8a8072", fontSize: 9, letterSpacing: 1 }}>{r.label}</span>
      <span style={{ color: "#33302c" }}>{r.c.toFixed(2)}</span>
      <span style={{ color: r.dp >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{r.dp >= 0 ? "▲" : "▼"} {Math.abs(r.dp).toFixed(2)}%</span>
    </span>)}
  </div>;
}
function QuoteLookup() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [news, setNews] = useState(null);
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (e.key === "/" && !e.target.closest("input") && !e.target.closest("textarea")) { e.preventDefault(); ref.current?.focus(); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  const go = async () => {
    const sym = q.trim().toUpperCase();
    if (!/^[A-Z.]{1,10}$/.test(sym)) return;
    setBusy(true); setRes(null); setNews(null);
    try { const r = await fetch(`/api/quotes?symbols=${sym}`); const d = await r.json(); setRes(d[sym] && d[sym].c ? { sym, ...d[sym] } : { sym, none: true }); } catch { setRes({ sym, none: true }); }
    setBusy(false);
    // Terminal N: recent headlines for the name, fetched after the quote lands
    try { const r = await fetch(`/api/news?symbol=${sym}`); if (r.ok) { const d = await r.json(); if (d.items && d.items.length) setNews(d); } } catch {}
  };
  return <div style={{ marginBottom: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontFamily: "'JetBrains Mono',monospace" }}>
      <span style={{ fontSize: 9, color: "#8a8072", letterSpacing: 2 }}>QUOTE</span>
      <input ref={ref} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} placeholder="Any US ticker — press / to focus" style={{ ...S.input, width: 250, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", padding: "7px 12px" }} />
      <button onClick={go} disabled={busy} style={{ ...S.btn, fontSize: 10, letterSpacing: 2, padding: "7px 16px", opacity: busy ? 0.5 : 1 }}>GO</button>
      {res && (res.none
        ? <span style={{ fontSize: 11, color: "#8a8072" }}>{res.sym} – no quote</span>
        : <span style={{ display: "inline-flex", gap: 12, alignItems: "center", fontSize: 12 }}>
            <span style={{ color: "#33302c", fontWeight: 700 }}>{res.sym}</span>
            <span style={{ color: "#33302c" }}>${res.c.toFixed(2)}</span>
            <span style={{ color: res.dp >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{res.dp >= 0 ? "▲" : "▼"} {Math.abs(res.dp).toFixed(2)}%</span>
            {res.h > res.l && <RangeBar h={res.h} l={res.l} c={res.c} />}
            {res.pc > 0 && <span style={{ fontSize: 9, color: "#8a8072" }}>PREV {res.pc.toFixed(2)}</span>}
          </span>)}
    </div>
    {news && res && !res.none && news.symbol === res.sym && <div style={{ margin: "8px 0 0 52px", maxWidth: 640 }}>
      {news.items.slice(0, 3).map((n, i) => <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.7"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, minWidth: 38 }}>{n.datetime ? new Date(n.datetime * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
        <span style={{ fontSize: 11, color: "#4a443c", lineHeight: 1.5 }}>{n.headline}<span style={{ fontSize: 8.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", marginLeft: 7, letterSpacing: 0.5, textTransform: "uppercase" }}>{n.source}</span></span>
      </a>)}
    </div>}
  </div>;
}

// ============ SMALL COMPONENTS ============
function Donut({ data, size = 200 }) { const [hov,setHov]=useState(null); const total=data.reduce((s,d)=>s+d.weight,0),C=["#0d6d56","#1f5a9e","#6d549e","#990f3d","#b0741e","#b3551d","#6f675c"]; let cum=-90; return <svg viewBox="0 0 200 200" width={size} height={size} style={{filter:"drop-shadow(0 4px 24px rgba(13,109,86,0.12)) drop-shadow(0 0 40px rgba(13,109,86,0.04))"}}>{data.map((d,i)=>{const a=(d.weight/total)*360,s=cum;cum+=a;const r=hov===i?84:80,rd=v=>(v*Math.PI)/180;const x1=100+r*Math.cos(rd(s)),y1=100+r*Math.sin(rd(s)),x2=100+r*Math.cos(rd(cum)),y2=100+r*Math.sin(rd(cum));return <path key={i} d={`M100,100 L${x1},${y1} A${r},${r} 0 ${a>180?1:0},1 ${x2},${y2} Z`} fill={C[i%C.length]} stroke="#f6eee1" strokeWidth="2.5" style={{transition:"all 0.25s",cursor:"pointer",filter:hov===i?`drop-shadow(0 0 8px ${C[i%C.length]}50)`:"none"}} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>})}<circle cx="100" cy="100" r="62" fill="#fffdf9" stroke="#e9ddc9" strokeWidth="1"/>{hov!==null?<><text x="100" y="97" textAnchor="middle" fill={C[hov%C.length]} fontSize="15" fontWeight="700" fontFamily="JetBrains Mono">{data[hov].ticker}</text><text x="100" y="114" textAnchor="middle" fill="#6f675c" fontSize="10" fontFamily="JetBrains Mono">{data[hov].weight}%</text></>:<><text x="100" y="99" textAnchor="middle" fill="#262421" fontSize="17" fontFamily="Instrument Serif, serif">Portfolio</text><text x="100" y="115" textAnchor="middle" fill="#8a8072" fontSize="9" fontFamily="JetBrains Mono">{data.length} holdings</text></>}</svg>; }
function HeatMap({ finnhubKey }){
  const [cells, setCells] = useState(() => HEATMAP.map(h => ({ ...h, change: (Math.random() * 9 - 4.5).toFixed(2) })));
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!finnhubKey || fetchedRef.current) return;
    fetchedRef.current = true;
    const cached = cacheGet("mb_heatmap", 5);
    if (cached) { setCells(cached); return; }
    async function load() {
      const results = HEATMAP.map(h => ({ ...h, change: "0.00" }));
      for (let i = 0; i < HEATMAP.length; i++) {
        try {
          const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${HEATMAP[i].ticker}&token=${finnhubKey}`);
          const d = await r.json();
          if (d.dp !== undefined) results[i].change = d.dp.toFixed(2);
        } catch {}
        if (i < HEATMAP.length - 1) await delay(120);
      }
      setCells(results);
      cacheSet("mb_heatmap", results);
    }
    load();
  }, [finnhubKey]);
  // No personal key: try the server-side proxy for real sector data
  useEffect(() => {
    if (finnhubKey) return;
    let cancelled = false;
    (async () => {
      try {
        const cached = cacheGet("mb_heatmap_proxy", 5);
        if (cached) { if (!cancelled) setCells(cached); return; }
        const r = await fetch(`/api/quotes?symbols=${HEATMAP.map(h => h.ticker).join(",")}`);
        if (!r.ok) return;
        const d = await r.json();
        if (!Object.keys(d).length) return;
        const results = HEATMAP.map(h => ({ ...h, change: d[h.ticker] && d[h.ticker].dp !== undefined ? d[h.ticker].dp.toFixed(2) : "0.00" }));
        if (!cancelled) { setCells(results); cacheSet("mb_heatmap_proxy", results); }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [finnhubKey]);
  const gc=c=>{const v=parseFloat(c);return v>3?"#15803d":v>1?"#1a9464":v>-1?"#6f675c":v>-3?"#b2342b":"#992d25"};
  return <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{cells.map(c=><a key={c.ticker} href={`https://www.tradingview.com/symbols/${c.ticker}/`} target="_blank" rel="noopener noreferrer" style={{background:gc(c.change)+"15",border:`1px solid ${gc(c.change)}30`,borderRadius:4,padding:"12px 0",flex:`${c.w} 1 0`,minWidth:70,textAlign:"center",cursor:"pointer",transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 2px 8px ${gc(c.change)}08`,textDecoration:"none"}} onMouseEnter={e=>{e.currentTarget.style.background=gc(c.change)+"30";e.currentTarget.style.transform="scale(1.05) translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 20px ${gc(c.change)}15`}} onMouseLeave={e=>{e.currentTarget.style.background=gc(c.change)+"15";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 2px 8px ${gc(c.change)}08`}}><div style={{fontSize:12,fontWeight:700,color:"#33302c",fontFamily:"'JetBrains Mono',monospace"}}>{c.ticker}</div><div style={{fontSize:11,color:gc(c.change),fontFamily:"'JetBrains Mono',monospace",marginTop:2,fontWeight:600}}>{parseFloat(c.change)>0?"+":""}{c.change}%</div><div style={{fontSize:8,color:"#8a8072",marginTop:3}}>{c.sector}</div></a>)}</div>;
}
function SourceChips({sources}){if(!sources||!sources.length)return null;return <div style={{borderTop:"1px solid #e9ddc920",paddingTop:14,marginTop:6}}><div style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Sources Cited</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sources.map((s,i)=><a key={i} href={s.url||"#"} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,background:"#f6eee1",border:"1px solid #e9ddc9",color:"#6f675c",fontSize:11,textDecoration:"none",fontFamily:"'JetBrains Mono',monospace",transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#0d6d5640";e.currentTarget.style.color="#0d6d56"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e9ddc9";e.currentTarget.style.color="#6f675c"}}><span style={{fontSize:9,opacity:0.4}}>{String(i+1).padStart(2,"0")}</span>{s.name}<span style={{fontSize:9,opacity:0.3}}>↗</span></a>)}</div></div>;}

// ============ CLOCK ============
function Clock(){const[now,setNow]=useState(new Date());useEffect(()=>{const iv=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(iv)},[]);const h=now.getHours(),m=now.getMinutes(),d=now.getDay();const wd=d>0&&d<6;const market=wd&&((h===9&&m>=30)||(h>9&&h<16));const pre=wd&&h>=4&&(h<9||(h===9&&m<30));const after=wd&&h>=16&&h<20;const label=market?"MARKET OPEN":pre?"PRE-MARKET":after?"AFTER HOURS":"MARKET CLOSED";const color=market?"#0d6d56":pre||after?"#b0741e":"#b2342b";let cd="";if(market){const cm=16*60-(h*60+m);cd=`${Math.floor(cm/60)}h ${cm%60}m to close`}else if(wd&&(h<9||(h===9&&m<30))){const om=9*60+30-(h*60+m);cd=`${Math.floor(om/60)}h ${om%60}m to open`}return <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><span style={{color:"#33302c",fontSize:15,fontWeight:500}}>{now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</span><span style={{color:"#1f5a9e",fontSize:15,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1.5}}>{now.toLocaleTimeString()}</span><span style={{fontSize:10,padding:"4px 12px",borderRadius:20,background:`${color}12`,color,border:`1px solid ${color}25`,fontWeight:600,letterSpacing:1.5,fontFamily:"'JetBrains Mono',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{width:6,height:6,borderRadius:3,background:color,animation:market?"pulse 2s infinite":"none"}}/>{label}</span>{cd&&<span style={{fontSize:10,color:"#6f675c",fontFamily:"'JetBrains Mono',monospace",padding:"3px 10px",borderRadius:10,background:"#f6eee180",border:"1px solid #e9ddc9"}}>{cd}</span>}</div>;}

// ============ MARKET REGIME ============
function RegimeIndicator({ apiKey }) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState(false), [fetchTime, setFetchTime] = useState(null);
  const fg = useFearGreed();
  const load = async () => { if (!apiKey) { setError(true); setLoading(false); return; } setLoading(true); setError(false); const r = await fetchRegime(apiKey); if (r) { setData(r); setFetchTime(new Date()); } else setError(true); setLoading(false); };
  const rc = data ? (data.regime === "Risk-On" ? "#0d6d56" : data.regime === "Risk-Off" ? "#b2342b" : "#b0741e") : "#8a8072";
  return <div style={{...S.card, animation:"fadeUp 0.5s ease 0.28s both"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:data?12:0}}>
      <h2 style={S.cardTitle}><span style={{color:"#b3551d"}}>◆</span> Market Regime<Info text="Shows current market conditions using VIX (volatility), CNN Fear & Greed Index (sentiment), and 10Y Treasury yield. Risk-On = bullish conditions, Risk-Off = defensive positioning. Sources: CBOE (VIX), CNN Business (Fear & Greed), U.S. Treasury Dept (10Y yield) via AI web search." link="https://www.investopedia.com/terms/v/vix.asp" linkLabel="What is the VIX?" /></h2>
      {apiKey && <div style={{display:"flex",alignItems:"center",gap:8}}>
        {fetchTime&&<span style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace"}}>Updated {fetchTime.toLocaleTimeString()}</span>}
        <button onClick={load} disabled={loading} style={{...S.btn,fontSize:10,padding:"4px 10px",opacity:loading?0.5:1}}>{loading?"⟳...":data?"↻":"Load"}</button>
      </div>}
    </div>
    {fg&&<div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap",marginBottom:data?12:6,padding:"8px 12px",borderRadius:8,background:"#f6eee1",border:"1px solid #e9ddc9"}}>
      <span style={{fontSize:19,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:fg.score>60?"#0d6d56":fg.score>40?"#b0741e":"#b2342b"}}>{Math.round(fg.score)}</span>
      <span style={{fontSize:11,color:"#33302c",fontWeight:600,textTransform:"capitalize"}}>{fg.rating}</span>
      {typeof fg.prev==="number"&&<span style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace"}}>prev close {Math.round(fg.prev)}</span>}
      <span style={{marginLeft:"auto",fontSize:8,color:"#a2977f",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}}>FEAR & GREED · PER CNN BUSINESS · LIVE</span>
    </div>}
    {!apiKey&&!data&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"12px 0",lineHeight:1.6}}>Live market regime analysis — tracks VIX, Fear & Greed Index, and 10Y Treasury yield in real time.<br/><span style={{fontSize:10,color:"#a2977f"}}>{fg?"Fear & Greed above is live for everyone — the full read is ":""}Powered by Claude AI + web search</span></p>}
    {apiKey&&!data&&!loading&&!error&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"8px 0"}}>Click Load to fetch VIX, Fear/Greed, and 10Y yield</p>}
    {error&&!loading&&apiKey&&<p style={{color:"#b2342b",fontSize:12,textAlign:"center",padding:"8px 0"}}>Failed to load — click Load to retry</p>}
    {loading&&<div style={{textAlign:"center",padding:"12px 0"}}><div style={{display:"inline-flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:3,background:"#b3551d",animation:"pulse 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
    {data&&<div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:13,fontWeight:700,color:rc,fontFamily:"'JetBrains Mono',monospace",padding:"4px 14px",borderRadius:20,background:`${rc}12`,border:`1px solid ${rc}25`}}>{data.regime}</span>
        <span style={{fontSize:12,color:"#6f675c"}}>{data.summary}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#f6eee1",border:"1px solid #e9ddc9"}}>
          <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:data.vix.level>25?"#b2342b":data.vix.level>18?"#b0741e":"#0d6d56"}}>{data.vix.level}</div>
          <div style={{fontSize:9,color:"#6f675c",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>VIX</div>
        </div>
        <div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#f6eee1",border:"1px solid #e9ddc9"}}>
          <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:data.fear_greed.score>60?"#0d6d56":data.fear_greed.score>40?"#b0741e":"#b2342b"}}>{data.fear_greed.score}</div>
          <div style={{fontSize:9,color:"#6f675c",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{data.fear_greed.label}</div>
        </div>
        <div style={{textAlign:"center",padding:"10px",borderRadius:8,background:"#f6eee1",border:"1px solid #e9ddc9"}}>
          <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:"#1f5a9e"}}>{data.ten_year.yield}%</div>
          <div style={{fontSize:9,color:"#6f675c",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>10Y Yield</div>
        </div>
      </div>
    </div>}
  </div>;
}

// ============ EARNINGS CALENDAR ============
function EarningsCal({ apiKey }) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState(false), [fetchTime, setFetchTime] = useState(null);
  const load = async () => { if (!apiKey) { setError(true); setLoading(false); return; } setLoading(true); setError(false); const r = await fetchEarnings(apiKey); if (r) { setData(r); setFetchTime(new Date()); } else setError(true); setLoading(false); };
  // Visitors: real upcoming earnings for the watchlist via the serverless proxy
  useEffect(() => {
    if (apiKey) return;
    let c = false;
    (async () => {
      try {
        const cached = cacheGet("mb_earn_proxy", 360);
        if (cached) { if (!c) setData(cached); return; }
        const r = await fetch(`/api/earnings?symbols=${TICKERS.map(t => t.symbol).join(",")}`);
        if (!r.ok) return;
        const rows = await r.json();
        if (!Array.isArray(rows) || !rows.length) return;
        const mapped = rows.map(e => ({ ticker: e.symbol, company: "", date: new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), time: e.hour === "bmo" ? "BMO" : e.hour === "amc" ? "AMC" : "—", est_eps: e.eps != null ? `$${e.eps.toFixed(2)}` : null }));
        if (!c) { setData(mapped); cacheSet("mb_earn_proxy", mapped); }
      } catch {}
    })();
    return () => { c = true; };
  }, [apiKey]);
  return <div style={{...S.card, animation:"fadeUp 0.5s ease 0.32s both"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:data?12:0}}>
      <h2 style={S.cardTitle}><span style={{color:"#1f5a9e"}}>◆</span> Earnings Calendar<Info text="Upcoming quarterly earnings reports for major companies. BMO = Before Market Open, AMC = After Market Close. Est EPS is the consensus analyst estimate. Source: Earnings data aggregated via AI web search from Yahoo Finance, Nasdaq, and MarketWatch." link="https://www.investopedia.com/terms/e/earningsreport.asp" linkLabel="Understanding earnings reports" /></h2>
      {apiKey && <div style={{display:"flex",alignItems:"center",gap:8}}>
        {fetchTime&&<span style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace"}}>Updated {fetchTime.toLocaleTimeString()}</span>}
        <button onClick={load} disabled={loading} style={{...S.btn,fontSize:10,padding:"4px 10px",opacity:loading?0.5:1}}>{loading?"⟳...":data?"↻":"Load"}</button>
      </div>}
    </div>
    {!apiKey&&!data&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"12px 0",lineHeight:1.6}}>Live earnings calendar — upcoming quarterly reports for major companies with EPS estimates.<br/><span style={{fontSize:10,color:"#a2977f"}}>Powered by Claude AI + web search</span></p>}
    {apiKey&&!data&&!loading&&!error&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"8px 0"}}>Load upcoming earnings reports</p>}
    {error&&!loading&&apiKey&&<p style={{color:"#b2342b",fontSize:12,textAlign:"center",padding:"8px 0"}}>Failed to load — click Load to retry</p>}
    {loading&&<div style={{textAlign:"center",padding:"12px 0"}}><div style={{display:"inline-flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:3,background:"#1f5a9e",animation:"pulse 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
    {data&&<div style={{display:"flex",flexDirection:"column",gap:4}}>{data.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderRadius:6,background:i%2===0?"#f6eee150":"transparent"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#0d6d56",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:12,minWidth:42}}>{e.ticker}</span><span style={{color:"#33302c",fontSize:12}}>{e.company}</span></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#6f675c",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{e.date}</span><span style={{fontSize:9,padding:"2px 8px",borderRadius:10,background:e.time==="BMO"?"#1f5a9e10":"#b0741e10",color:e.time==="BMO"?"#1f5a9e":"#b0741e",fontFamily:"'JetBrains Mono',monospace"}}>{e.time}</span>{e.est_eps&&<span style={{color:"#8a8072",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>Est: {e.est_eps}</span>}</div>
    </div>)}</div>}
  </div>;
}

// ============ ECON CALENDAR ============
async function fetchEconCal(key) {
  if (!key) return null;
  const cached = cacheGet("mb_econ_cal", 120);
  if (cached) return cached;
  try {
    const d = await callAPI(key, { model: "claude-sonnet-5", max_tokens: 1500, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
      messages: [{ role: "user", content: `Search for upcoming US economic calendar events for the next 2 weeks. Include Fed meetings (FOMC), CPI releases, jobs reports (NFP), GDP, PPI, retail sales, and any other major economic data releases. Return ONLY a JSON array: [{"event":"FOMC Rate Decision","date":"Apr 30","time":"2:00 PM ET","importance":"high","prior":"5.25-5.50%"}]. importance should be "high", "medium", or "low". Include 8-12 events. Return ONLY the JSON array.` }] });
    const raw = extractText(d);
    if (!raw) return null;
    const match = raw.match(/\[[\s\S]*\]/);
    const result = match ? JSON.parse(match[0]) : JSON.parse(raw);
    if (result) cacheSet("mb_econ_cal", result);
    return result;
  } catch (e) { console.error("EconCal error:", e); return null; }
}
function EconCalendar({ apiKey }) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState(false), [fetchTime, setFetchTime] = useState(null);
  const load = async () => { if (!apiKey) { setError(true); return; } setLoading(true); setError(false); const r = await fetchEconCal(apiKey); if (r) { setData(r); setFetchTime(new Date()); } else setError(true); setLoading(false); };
  const ic = { high: "#b2342b", medium: "#b0741e", low: "#8a8072" };
  // Visitors: deterministic calendar from official annual release schedules
  useEffect(() => {
    if (apiKey) return;
    let c = false;
    (async () => {
      try {
        const r = await fetch("/econ-2026.json");
        if (!r.ok) return;
        const d = await r.json();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const rows = (d.events || []).filter(e => new Date(e.date + "T23:59:00") >= today).slice(0, 6).map(e => ({ event: e.event, date: new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), time: e.time, importance: e.imp }));
        if (rows.length && !c) setData(rows);
      } catch {}
    })();
    return () => { c = true; };
  }, [apiKey]);
  return <div style={{...S.card, animation:"fadeUp 0.5s ease 0.36s both"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:data?12:0}}>
      <h2 style={S.cardTitle}><span style={{color:"#990f3d"}}>◆</span> Economic Calendar<Info text="Upcoming economic data releases — Fed rate decisions (FOMC), inflation (CPI/PPI), employment (NFP), GDP, and retail sales. Red dot = high market impact. Source: Federal Reserve, BLS, BEA, and Census Bureau schedules via AI web search." link="https://www.investopedia.com/terms/e/economic-calendar.asp" linkLabel="Economic indicators explained" /></h2>
      {apiKey && <div style={{display:"flex",alignItems:"center",gap:8}}>
        {fetchTime&&<span style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace"}}>Updated {fetchTime.toLocaleTimeString()}</span>}
        <button onClick={load} disabled={loading} style={{...S.btn,fontSize:10,padding:"4px 10px",opacity:loading?0.5:1}}>{loading?"⟳...":data?"↻":"Load"}</button>
      </div>}
    </div>
    {!apiKey&&!data&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"12px 0",lineHeight:1.6}}>Live economic calendar — upcoming FOMC, CPI, NFP, GDP, and PPI releases with impact ratings.<br/><span style={{fontSize:10,color:"#a2977f"}}>Powered by Claude AI + web search</span></p>}
    {apiKey&&!data&&!loading&&!error&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"8px 0"}}>Upcoming Fed, CPI, NFP, GDP releases</p>}
    {error&&!loading&&apiKey&&<p style={{color:"#b2342b",fontSize:12,textAlign:"center",padding:"8px 0"}}>Failed to load — click Load to retry</p>}
    {loading&&<div style={{textAlign:"center",padding:"12px 0"}}><div style={{display:"inline-flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:3,background:"#990f3d",animation:"pulse 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div>}
    {data&&<div style={{display:"flex",flexDirection:"column",gap:4}}>{data.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:i%2===0?"rgba(64,52,32,0.04)":"transparent",transition:"all 0.2s"}} onMouseEnter={ev=>ev.currentTarget.style.background="rgba(13,109,86,0.03)"} onMouseLeave={ev=>ev.currentTarget.style.background=i%2===0?"rgba(64,52,32,0.04)":"transparent"}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:6,height:6,borderRadius:3,background:ic[e.importance]||"#8a8072",flexShrink:0}}/>
        <span style={{color:"#33302c",fontSize:12,fontWeight:500}}>{e.event}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:"#6f675c",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{e.date}</span>
        {e.time&&<span style={{color:"#8a8072",fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>{e.time}</span>}
        {e.prior&&<span style={{color:"#8a8072",fontSize:9,fontFamily:"'JetBrains Mono',monospace",padding:"2px 6px",borderRadius:6,background:"rgba(64,52,32,0.06)"}}>Prior: {e.prior}</span>}
      </div>
    </div>)}</div>}
  </div>;
}

// ============ NOTES ============
// Market Diary — the notes card upgraded: every entry is datelined AND stamped with the tape
// at the moment of writing. Tagged entries; "question" entries resurface after 30 days.
const DIARY_TAGS = [["note", "#6f675c"], ["thesis", "#0d6d56"], ["macro", "#1f5a9e"], ["earnings", "#b0741e"], ["mistake", "#b2342b"], ["question", "#6d549e"], ["lesson", "#b3551d"]];
function MarketDiary({ prices, live }) {
  const [entries, setEntries] = useState(() => {
    let d = lsGet("mjb_diary", null);
    if (d === null) {
      // one-time migration from the old Quick Notes card
      const old = lsGet("mb_notes", []);
      d = old.map(n => ({ id: n.id, d: "", time: n.time, text: n.text, tag: "note", stamp: {} }));
      lsSet("mjb_diary", d);
      try { localStorage.removeItem("mb_notes"); } catch {}
    }
    return d;
  });
  const [input, setInput] = useState("");
  const [tag, setTag] = useState("note");
  const save = n => { setEntries(n); lsSet("mjb_diary", n); };
  const stampNow = () => {
    const st = {};
    if (live && prices) { const s = prices.find(p => p.symbol === "SPY"); if (s && s.price !== "—") { st.spy = parseFloat(s.price); st.chg = parseFloat(s.change); } }
    try { const c = cacheGet("mjb_tsy_curve", 1440); if (c && c.length && c[c.length - 1].p[120] != null) st.tenY = c[c.length - 1].p[120]; } catch {}
    return st;
  };
  const add = () => {
    if (!input.trim()) return;
    save([{ id: Date.now(), d: todayISO(), time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), text: input.trim(), tag, stamp: stampNow() }, ...entries]);
    setInput(""); setTag("note");
  };
  const rm = id => save(entries.filter(n => n.id !== id));
  const resolve = id => save(entries.map(n => n.id === id ? { ...n, resolved: true } : n));
  const openQs = entries.filter(n => n.tag === "question" && !n.resolved && n.d && n.d <= addDaysISO(-30));
  const stampStr = st => [st.spy ? `SPY ${st.spy.toFixed(2)} ${st.chg >= 0 ? "+" : "−"}${Math.abs(st.chg).toFixed(2)}%` : "", st.tenY ? `10Y ${st.tenY.toFixed(2)}%` : ""].filter(Boolean).join(" · ");
  const tagColor = t => (DIARY_TAGS.find(x => x[0] === t) || DIARY_TAGS[0])[1];
  return <section style={S.card}>
    <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Market Diary<Info text="A dated journal that stamps each entry with the tape at the moment of writing — SPY and the 10-year — so you can reread what you thought next to what the market was doing. Tag entries; open questions resurface after 30 days. Lives in this browser only." /></h2>
    {openQs.length > 0 && <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(109,84,158,0.06)", border: "1px solid rgba(109,84,158,0.25)" }}>
      {openQs.slice(0, 2).map(q => <div key={q.id} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "2px 0" }}>
        <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#6d549e", letterSpacing: 1.5, flexShrink: 0 }}>STILL OPEN?</span>
        <span style={{ fontSize: 11.5, color: "#4a443c", flex: 1, lineHeight: 1.5 }}>{q.text}</span>
        <button onClick={() => resolve(q.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", padding: 0, textDecoration: "underline dotted", textUnderlineOffset: 2, flexShrink: 0 }}>RESOLVED</button>
      </div>)}
    </div>}
    <div style={{ display: "flex", gap: 6, marginBottom: entries.length ? 10 : 0, flexWrap: "wrap" }}>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="What do you think, and why —" style={{ flex: 1, minWidth: 160, background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 8, padding: "8px 12px", color: "#33302c", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", outline: "none" }} />
      <select value={tag} onChange={e => setTag(e.target.value)} style={{ ...S.input, width: "auto", fontSize: 10, padding: "6px 8px", fontFamily: "'JetBrains Mono',monospace" }}>{DIARY_TAGS.map(([t]) => <option key={t} value={t}>{t}</option>)}</select>
      <button onClick={add} style={{ ...S.btn, padding: "8px 16px" }}>File</button>
    </div>
    {entries.length === 0 && <p style={{ color: "#8a8072", fontSize: 11, textAlign: "center", padding: "8px 0" }}>Theses, questions, mistakes — filed with the tape they were written against.</p>}
    {entries.slice(0, 8).map(n => <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "7px 10px", borderRadius: 6, background: "#f6eee1", border: "1px solid #e9ddc9", marginBottom: 4 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#33302c", fontSize: 12, lineHeight: 1.55 }}>{n.text}{n.resolved && <span style={{ fontSize: 8.5, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", marginLeft: 6 }}>RESOLVED</span>}</div>
        <div style={{ color: "#8a8072", fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", marginTop: 2, letterSpacing: 0.5 }}>
          <span style={{ color: tagColor(n.tag), textTransform: "uppercase", letterSpacing: 1.5 }}>{n.tag}</span>
          {" · "}{n.d || ""}{n.time ? ` ${n.time}` : ""}{stampStr(n.stamp || {}) ? ` · ${stampStr(n.stamp)}` : ""}
        </div>
      </div>
      <button onClick={() => rm(n.id)} style={{ background: "none", border: "none", color: "#8a8072", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>×</button>
    </div>)}
    {entries.length > 8 && <div style={{ fontSize: 9, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginTop: 4 }}>+ {entries.length - 8} earlier entries on file</div>}
  </section>;
}

// Positions Ledger — the paper book. Fills at the live quote at click time; every buy requires a
// one-line thesis. Cost basis is stored at trade time, so no historical data is needed. Desk-only.
function PositionsLedger() {
  const [book, setBook] = useState(() => lsGet("mjb_paper", { cash: 100000, positions: [], blotter: [] }));
  const [form, setForm] = useState({ t: "", sh: "", thesis: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [marks, setMarks] = useState({});
  const save = b => { setBook(b); lsSet("mjb_paper", b); };
  const held = book.positions.map(p => p.ticker).join(",");
  useEffect(() => {
    if (!held) return;
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_paper_marks", 5); if (cached) { if (on) setMarks(cached); return; }
        const r = await fetch(`/api/quotes?symbols=${held}`);
        if (!r.ok) return;
        const d = await r.json();
        const m = {}; held.split(",").forEach(t => { if (d[t] && d[t].c) m[t] = d[t].c; });
        if (on && Object.keys(m).length) { setMarks(m); cacheSet("mjb_paper_marks", m); }
      } catch {}
    })();
    return () => { on = false; };
  }, [held]);
  const trade = async action => {
    setMsg(""); setBusy(true);
    try {
      const t = form.t.trim().toUpperCase(), sh = Math.floor(+form.sh), thesis = form.thesis.trim();
      if (!/^[A-Z.]{1,10}$/.test(t) || !(sh > 0)) return setMsg("A ticker and a whole-share count, please.");
      if (action === "buy" && thesis.length < 8) return setMsg("No thesis, no fill — one honest line first.");
      let px = null;
      try { const r = await fetch(`/api/quotes?symbols=${t}`); if (r.ok) { const d = await r.json(); if (d[t] && d[t].c) px = d[t].c; } } catch {}
      if (!px) return setMsg("No fill — quote unavailable (unknown ticker, or the wire is down).");
      const b = { cash: book.cash, positions: [...book.positions], blotter: [...book.blotter] };
      const i = b.positions.findIndex(p => p.ticker === t);
      if (action === "buy") {
        const cost = px * sh;
        if (cost > b.cash) return setMsg(`Insufficient cash — cost $${cost.toFixed(0)} against $${b.cash.toFixed(0)} available.`);
        b.cash -= cost;
        if (i < 0) b.positions.push({ ticker: t, shares: sh, basis: px, entryDate: todayISO(), thesis });
        else { const p = b.positions[i]; b.positions[i] = { ...p, basis: (p.basis * p.shares + cost) / (p.shares + sh), shares: p.shares + sh, thesis: thesis || p.thesis }; }
      } else {
        if (i < 0 || b.positions[i].shares < sh) return setMsg("The book doesn't hold that many shares.");
        b.cash += px * sh;
        const p = b.positions[i];
        if (p.shares === sh) b.positions.splice(i, 1); else b.positions[i] = { ...p, shares: p.shares - sh };
      }
      b.blotter.unshift({ d: todayISO(), time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), action, ticker: t, shares: sh, price: px, thesis: action === "buy" ? thesis : "" });
      if (b.blotter.length > 60) b.blotter.length = 60;
      save(b);
      setForm({ t: "", sh: "", thesis: "" });
      try { localStorage.removeItem("mjb_paper_marks"); } catch {}
    } finally { setBusy(false); }
  };
  const reset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    const arch = lsGet("mjb_paper_archive", []);
    arch.unshift({ closed: todayISO(), book });
    lsSet("mjb_paper_archive", arch);
    save({ cash: 100000, positions: [], blotter: [] });
    setConfirmReset(false);
  };
  const mark = p => marks[p.ticker] || null;
  const mv = book.positions.reduce((s, p) => s + p.shares * (mark(p) || p.basis), 0);
  const fmt$ = v => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return <div>
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "baseline", marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>
      <span style={{ fontSize: 12, color: "#33302c" }}><span style={{ fontSize: 8.5, color: "#8a8072", letterSpacing: 1.5 }}>BOOK </span>{fmt$(book.cash + mv)}</span>
      <span style={{ fontSize: 12, color: "#33302c" }}><span style={{ fontSize: 8.5, color: "#8a8072", letterSpacing: 1.5 }}>CASH </span>{fmt$(book.cash)}</span>
      <span style={{ fontSize: 12, color: book.cash + mv >= 100000 ? "#0d6d56" : "#b2342b" }}><span style={{ fontSize: 8.5, color: "#8a8072", letterSpacing: 1.5 }}>SINCE OPEN </span>{book.cash + mv >= 100000 ? "+" : "−"}{Math.abs((book.cash + mv) / 100000 - 1).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 })}</span>
      <button onClick={reset} onBlur={() => setConfirmReset(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: confirmReset ? "#b2342b" : "#8a8072", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{confirmReset ? "Click again — archives this book" : "Reset the book"}</button>
    </div>
    {book.positions.length === 0 && <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "10px 0", lineHeight: 1.7 }}>An empty book and $100,000 of paper. Every buy requires a one-line thesis — the ledger is a journal wearing a P&L.</p>}
    {book.positions.map((p, i) => {
      const m = mark(p), pnl = m ? (m - p.basis) * p.shares : null, pct = m ? (m / p.basis - 1) * 100 : null;
      return <div key={p.ticker} style={{ borderTop: i ? "1px solid #efe4d2" : "1px solid #ddcfb8", padding: "8px 2px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, flexWrap: "wrap" }}>
          <span style={{ color: "#0d6d56", fontWeight: 700, minWidth: 44 }}>{p.ticker}</span>
          <span style={{ color: "#6f675c" }}>{p.shares} sh @ {p.basis.toFixed(2)}</span>
          <span style={{ color: "#33302c" }}>{m ? `last ${m.toFixed(2)}` : "mark pending"}</span>
          {pnl != null && <span style={{ color: pnl >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600, marginLeft: "auto" }}>{pnl >= 0 ? "+" : "−"}${Math.abs(pnl).toFixed(0)} ({pct >= 0 ? "+" : "−"}{Math.abs(pct).toFixed(1)}%)</span>}
        </div>
        <div style={{ fontSize: 10.5, color: "#8a8072", fontStyle: "italic", marginTop: 2, lineHeight: 1.5 }}>“{p.thesis}” <span style={{ fontStyle: "normal", fontSize: 8, fontFamily: "'JetBrains Mono',monospace" }}>— {p.entryDate}</span></div>
      </div>;
    })}
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
      <input value={form.t} onChange={e => setForm({ ...form, t: e.target.value })} placeholder="Ticker" style={{ ...S.input, width: 66, fontSize: 10.5, padding: "6px 8px", fontFamily: "'JetBrains Mono',monospace" }} />
      <input value={form.sh} onChange={e => setForm({ ...form, sh: e.target.value })} placeholder="Shares" style={{ ...S.input, width: 60, fontSize: 10.5, padding: "6px 8px", fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }} />
      <input value={form.thesis} onChange={e => setForm({ ...form, thesis: e.target.value })} placeholder="Thesis — required to buy" style={{ ...S.input, flex: 1, minWidth: 150, fontSize: 11, padding: "6px 9px" }} />
      <button onClick={() => trade("buy")} disabled={busy} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "6px 14px", opacity: busy ? 0.5 : 1 }}>Buy</button>
      <button onClick={() => trade("sell")} disabled={busy} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "6px 14px", color: "#b2342b", border: "1px solid #b2342b30", opacity: busy ? 0.5 : 1 }}>Sell</button>
    </div>
    {msg && <div style={{ marginTop: 8, fontSize: 10.5, color: "#b2342b" }}>{msg}</div>}
    {book.blotter.length > 0 && <div style={{ marginTop: 12, borderTop: "1px solid #ddcfb8", paddingTop: 8 }}>
      <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Blotter</div>
      {book.blotter.slice(0, 6).map((x, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: "2px 0" }}>
        <span style={{ color: "#a2977f", fontSize: 8, minWidth: 92 }}>{x.d} {x.time}</span>
        <span style={{ color: x.action === "buy" ? "#0d6d56" : "#b2342b", textTransform: "uppercase", letterSpacing: 1, minWidth: 32 }}>{x.action}</span>
        <span style={{ color: "#33302c" }}>{x.shares} {x.ticker} @ {x.price.toFixed(2)}</span>
      </div>)}
    </div>}
    <SourceLine>Paper only — fills simulated at the last trade, no spread or commissions · marks via the live tape, 5-min cache · the book lives in this browser</SourceLine>
  </div>;
}

// ============ BENNETT VS. THE TAPE + THE LATE EDITION ============
// Three fixed daily calls, filed before the 4pm bell and graded automatically:
// SPY direction and QQQ/IWM leadership resolve from the closing tape the same
// evening; the 10-year resolves from the Treasury CSV once the day's row lands.
const etNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
const isAfterCloseET = () => { const d = etNow(); return isTradingDay(d) && d.getHours() * 60 + d.getMinutes() >= 960; };
const isBeforeCloseET = () => { const d = etNow(); return isTradingDay(d) && d.getHours() * 60 + d.getMinutes() < 960; };
const BVT_QS = [
  { k: "spy", q: "Where does SPY close?", opts: [["up", "Up on the day"], ["down", "Down on the day"]] },
  { k: "lead", q: "Growth or small caps — which leads?", opts: [["QQQ", "QQQ leads"], ["IWM", "IWM leads"]] },
  { k: "teny", q: "The 10-year yield closes…", opts: [["higher", "Higher than yesterday"], ["lower", "Lower than yesterday"]] },
];
function resolvePredictions(prices, live) {
  const ps = lsGet("mjb_predictions", []);
  let changed = false;
  const t = todayISO(), afterClose = isAfterCloseET();
  ps.forEach(p => {
    if (p.correct !== undefined || p.voided) return;
    if (p.k === "teny") {
      const rows = cacheGet("mjb_tsy_curve", 1e9) || [];
      const i = rows.findIndex(r => r.date === p.d);
      if (i > 0 && rows[i].p[120] != null && rows[i - 1].p[120] != null) {
        p.actual = rows[i].p[120] > rows[i - 1].p[120] ? "higher" : "lower";
        p.correct = p.actual === p.guess; changed = true;
      } else if (p.d < addDaysISO(-7)) { p.voided = true; changed = true; }
    } else if (p.d === t && afterClose && live && prices) {
      if (p.k === "spy") { const s = prices.find(x => x.symbol === "SPY"); if (s && s.price !== "—") { p.actual = parseFloat(s.change) >= 0 ? "up" : "down"; p.correct = p.actual === p.guess; changed = true; } }
      if (p.k === "lead") { const q = prices.find(x => x.symbol === "QQQ"), iw = prices.find(x => x.symbol === "IWM"); if (q && iw && q.price !== "—" && iw.price !== "—") { p.actual = parseFloat(q.change) >= parseFloat(iw.change) ? "QQQ" : "IWM"; p.correct = p.actual === p.guess; changed = true; } }
    } else if (p.d < t) { p.voided = true; changed = true; } // the close was never taken — no grade, no credit
  });
  if (changed) { lsSet("mjb_predictions", ps); learnPing(); }
}
function BennettVsTape({ prices, live }) {
  useLearnTick();
  const [, force] = useState(0);
  useEffect(() => { resolvePredictions(prices, live); }, [prices, live]);
  const t = todayISO();
  const preds = lsGet("mjb_predictions", []);
  const todays = k => preds.find(p => p.d === t && p.k === k);
  const guess = (k, g) => { const ps = lsGet("mjb_predictions", []); if (ps.some(p => p.d === t && p.k === k)) return; ps.unshift({ d: t, k, guess: g }); if (ps.length > 400) ps.length = 400; lsSet("mjb_predictions", ps); recordEdition("tape"); force(x => x + 1); learnPing(); };
  const resolved = preds.filter(p => p.correct !== undefined);
  const byK = {}; resolved.forEach(p => { const b = byK[p.k] = byK[p.k] || { n: 0, r: 0 }; b.n++; if (p.correct) b.r++; });
  const rates = BVT_QS.map(q => ({ ...q, ...byK[q.k] })).filter(x => x.n);
  const worst = rates.length > 1 ? rates.reduce((a, b) => (a.r / a.n <= b.r / b.n ? a : b)) : null;
  const open = isBeforeCloseET();
  return <div>
    {open ? BVT_QS.map(q => { const g = todays(q.k); return <div key={q.k} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid #efe4d2", flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, color: "#33302c", flex: 1, minWidth: 170 }}>{q.q}</span>
      {g ? <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 1 }}>FILED: {g.guess.toUpperCase()}</span>
        : <span style={{ display: "inline-flex", gap: 12 }}>{q.opts.map(([v, l]) => <button key={v} onClick={() => guess(q.k, v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", color: "#1f5a9e", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{l}</button>)}</span>}
    </div>; }) : <p style={{ fontSize: 11.5, color: "#8a8072", lineHeight: 1.7, padding: "4px 0" }}>The window is closed — calls are filed before the 4pm bell on trading days. {preds.some(p => p.d === t) ? "Today's grades print in the Late Edition below the bell." : "Come back at the open."}</p>}
    {rates.length > 0 && <div style={{ borderTop: "1px solid #ddcfb8", marginTop: 10, paddingTop: 8 }}>
      <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Calibration</div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        {rates.map(x => <span key={x.k} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: worst && worst.k === x.k && x.r / x.n < 0.5 ? "#990f3d" : "#33302c" }}>
          <span style={{ fontSize: 8.5, color: "#8a8072", letterSpacing: 1 }}>{x.k.toUpperCase()} </span>{Math.round(x.r / x.n * 100)}% <span style={{ color: "#a2977f", fontSize: 8.5 }}>({x.r}/{x.n})</span>
        </span>)}
      </div>
    </div>}
    <SourceLine>Filed before the bell, graded by the tape · misses teach calibration, not shame · private to this browser</SourceLine>
  </div>;
}

// The 7 O'Clock Note — the pre-open first-call sheet. Renders on trading days before 9:30 ET,
// composing the overnight tape, wire leads, calendar, filings, and everything due on the desk.
// The two-sentence "top call" is Claude-written via the existing key gate, once per morning.
function FirstCall({ prices, live, apiKey }) {
  useLearnTick();
  const [wire, setWire] = useState(() => cacheGet("mjb_wire", 10));
  const [filings, setFilings] = useState(() => cacheGet("mjb_edgar", 10));
  const [econ, setEcon] = useState(null);
  const [ai, setAi] = useState(() => { const c = cacheGet("mjb_firstcall_ai", 1440); return c && c.d === todayISO() ? c.text : null; });
  const [aiBusy, setAiBusy] = useState(false);
  const now = etNow(), mins = now.getHours() * 60 + now.getMinutes();
  const show = isTradingDay(now) && mins < 570;
  useEffect(() => {
    if (!show) return;
    let on = true;
    if (!wire) (async () => { try { const r = await fetch("/api/rss"); if (!r.ok) return; const d = await r.json(); if (d.items && d.items.length && on) { setWire(d); cacheSet("mjb_wire", d); } } catch {} })();
    if (!filings) (async () => { try { const r = await fetch("/api/edgar?forms=8-K,13D,S-1"); if (!r.ok) return; const d = await r.json(); if (d.items && d.items.length && on) { setFilings(d.items); cacheSet("mjb_edgar", d.items); } } catch {} })();
    (async () => { try { const r = await fetch("/econ-2026.json"); if (!r.ok) return; const d = await r.json(); if (on && d.events) setEcon(d.events); } catch {} })();
    return () => { on = false; };
  }, [show]);
  const leads = wire && wire.items ? clusterWire(wire.items).slice(0, 4) : [];
  const eightKs = (filings || []).filter(f => f.form === "8-K").slice(0, 3);
  const nextEvents = (econ || []).filter(e => e.date >= todayISO()).slice(0, 3);
  const tape = live && prices ? ["SPY", "QQQ", "TLT", "GLD"].map(s => prices.find(p => p.symbol === s)).filter(p => p && p.price !== "—") : [];
  const due = lsGet("mjb_srs", []).filter(c => c.due <= todayISO()).length;
  const openNotices = lsGet("mjb_notices", []).filter(n => !n.dismissed).length;
  const budget = lsGet("mjb_desk_budget", null);
  const held = budget && budget.todos ? budget.todos.filter(x => !x.done && (budget.d !== todayISO() || x.held)).length : 0;
  const unfiled = BVT_QS.filter(q => !lsGet("mjb_predictions", []).some(p => p.d === todayISO() && p.k === q.k)).length;
  const writeCall = async () => {
    if (!apiKey || aiBusy) return;
    setAiBusy(true);
    try {
      const d = await callAPI(apiKey, { model: "claude-sonnet-5", max_tokens: 300, messages: [{ role: "user", content: `You are writing the "top call" of a private morning first-call note for a finance analyst, before the US open.\nOvernight tape: ${tape.map(p => `${p.symbol} ${p.price} (${p.change}%)`).join(", ") || "unavailable"}.\nOvernight headlines:\n${leads.map(c => `${c.lead.label}: ${c.lead.title}`).join("\n") || "none"}\nUpcoming data: ${nextEvents.map(e => `${e.date} ${e.event}`).join("; ") || "none"}\nWrite EXACTLY 2-3 sentences in confident sell-side morning-note style: what matters most today and why. No advice, no disclaimers, no preamble — start mid-thought like a desk note.` }] });
      const text = extractText(d);
      if (text) { setAi(text); cacheSet("mjb_firstcall_ai", { d: todayISO(), text }); }
    } catch {} finally { setAiBusy(false); }
  };
  useEffect(() => { if (show && apiKey && !ai && !aiBusy && (leads.length || tape.length)) writeCall(); }, [show, apiKey, leads.length]);
  if (!show) return null;
  const toOpen = 570 - mins;
  const Sec = ({ label, children }) => <div style={{ minWidth: 0 }}><div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", margin: "8px 0 4px" }}>{label}</div>{children}</div>;
  return <div style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -4, borderRadius: 2, padding: "14px 18px", marginBottom: 16, background: "#fffdf9" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase" }}>The 7 O'Clock Note</span>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 15, color: "#262421" }}>{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
      <Info text="The morning first-call sheet: overnight tape, top wire stories, the next data prints, overnight 8-Ks, and everything due on the desk. Appears on trading days until the 9:30 open, then retires for the day. With your API key set, Claude writes the two-sentence top call once per morning — private, never shown to visitors." />
      <span style={{ marginLeft: "auto", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 1 }}>OPENS IN {Math.floor(toOpen / 60)}H {String(toOpen % 60).padStart(2, "0")}M</span>
    </div>
    {tape.length > 0 && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#6f675c", display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>{tape.map(p => <span key={p.symbol}>{p.symbol} {p.price} <span style={{ color: parseFloat(p.change) >= 0 ? "#0d6d56" : "#b2342b" }}>{parseFloat(p.change) >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(p.change)).toFixed(2)}%</span></span>)}</div>}
    {ai && <p style={{ fontSize: 12.5, color: "#33302c", lineHeight: 1.7, margin: "10px 0 2px", borderLeft: "2px solid #0d6d56", paddingLeft: 10 }}>{ai}<span style={{ fontSize: 7.5, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", letterSpacing: 1, marginLeft: 8 }}>TOP CALL · CLAUDE · PRIVATE</span></p>}
    {!ai && apiKey && aiBusy && <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 1.5, margin: "8px 0 0" }}>WRITING THE TOP CALL…</div>}
    <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
      <Sec label="Overnight wire">
        {leads.length === 0 && <div style={{ fontSize: 10, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5 }}>AWAITING WIRE <span style={{ animation: "blink 1s step-end infinite", color: "#0d6d56" }}>▮</span></div>}
        {leads.map(c => <div key={c.lead.link} style={{ padding: "2px 0" }}>
          <a href={c.lead.link} target="_blank" rel="noopener noreferrer" onClick={() => logRead(c.lead)} style={{ fontSize: 11.5, color: "#33302c", textDecoration: "none", lineHeight: 1.45 }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{c.lead.title}</a>
          <span style={{ fontSize: 7.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", marginLeft: 6, letterSpacing: 0.5 }}>{c.lead.label}</span>
        </div>)}
      </Sec>
      <div>
        <Sec label="On the calendar">
          {nextEvents.length === 0 && <span style={{ fontSize: 10.5, color: "#8a8072" }}>Nothing major scheduled.</span>}
          {nextEvents.map(e => <div key={e.date + e.event} style={{ fontSize: 10.5, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", padding: "1px 0" }}><span style={{ color: e.date === todayISO() ? "#990f3d" : "#8a8072" }}>{e.date === todayISO() ? "TODAY" : e.date.slice(5)}</span> {e.event} · {e.time}</div>)}
        </Sec>
        {eightKs.length > 0 && <Sec label="Overnight 8-Ks">
          {eightKs.map((f, i) => <div key={i} style={{ fontSize: 10.5, color: "#4a443c", padding: "1px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><a href={f.link} target="_blank" rel="noopener noreferrer" style={{ color: "#4a443c", textDecoration: "none" }}>{f.title.replace(/^[^-]+-\s*/, "").replace(/\s*\(\d{7,}\)\s*/g, " ").replace(/\((Filer|Subject|Reporting Owner|Reporting)\)/gi, "").trim()}</a></div>)}
        </Sec>}
        <Sec label="On the desk">
          {due + openNotices + held + (unfiled < 3 ? 0 : 0) === 0 && unfiled === 0 ? <span style={{ fontSize: 10.5, color: "#0d6d56" }}>The desk is clear.</span> : <div style={{ fontSize: 10.5, color: "#4a443c", lineHeight: 1.7 }}>
            {due > 0 && <div>{due} card{due === 1 ? "" : "s"} due in the Review Docket.</div>}
            {openNotices > 0 && <div>{openNotices} unread notice{openNotices === 1 ? "" : "s"}.</div>}
            {held > 0 && <div>{held} item{held === 1 ? "" : "s"} held over from yesterday's desk.</div>}
            {unfiled > 0 && <div>{unfiled} call{unfiled === 1 ? "" : "s"} not yet filed at Bennett vs. the Tape.</div>}
          </div>}
        </Sec>
      </div>
    </div>
    {!apiKey && <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", letterSpacing: 1, marginTop: 8 }}>ADD YOUR ANTHROPIC KEY IN SETTINGS AND THE NOTE WRITES ITS OWN TOP CALL EACH MORNING</div>}
  </div>;
}

function LateEdition({ prices, live }) {
  useLearnTick();
  const [line, setLine] = useState("");
  const [, force] = useState(0);
  useEffect(() => { resolvePredictions(prices, live); }, [prices, live]);
  if (!isAfterCloseET()) return null;
  const t = todayISO();
  const lessonFiled = lsGet("mjb_diary", []).some(e => e.tag === "lesson" && e.d === t);
  const preds = lsGet("mjb_predictions", []).filter(p => p.d === t);
  const closes = live && prices ? ["SPY", "QQQ", "TLT", "GLD"].map(s => prices.find(p => p.symbol === s)).filter(p => p && p.price !== "—") : [];
  const movers = live && prices ? [...prices].filter(p => p.price !== "—").sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change))) : [];
  const fileLesson = () => {
    if (!line.trim()) return;
    const d = lsGet("mjb_diary", []);
    const st = {}; const s = live && prices ? prices.find(p => p.symbol === "SPY") : null;
    if (s && s.price !== "—") { st.spy = parseFloat(s.price); st.chg = parseFloat(s.change); }
    d.unshift({ id: Date.now(), d: t, time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), text: line.trim(), tag: "lesson", stamp: st });
    lsSet("mjb_diary", d);
    recordEdition("late");
    setLine(""); force(x => x + 1); learnPing();
  };
  return <div style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -4, borderRadius: 2, padding: "14px 18px", marginBottom: 16, background: "#fffdf9" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#990f3d", letterSpacing: 3, textTransform: "uppercase" }}>Late Edition</span>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 15, color: "#262421" }}>The bell has rung.</span>
      <Info text="Appears after the 4pm close on trading days: the closing tape, the biggest mover on the house list, and the morning's calls graded against what actually happened. Filing the one-sentence lesson stamps it into the Market Diary and puts the day's edition to bed." />
      {closes.length > 0 && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#6f675c", display: "inline-flex", gap: 12, flexWrap: "wrap" }}>{closes.map(p => <span key={p.symbol}>{p.symbol} {p.price} <span style={{ color: parseFloat(p.change) >= 0 ? "#0d6d56" : "#b2342b" }}>{parseFloat(p.change) >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(p.change)).toFixed(2)}%</span></span>)}</span>}
    </div>
    {movers[0] && <div style={{ fontSize: 11, color: "#4a443c", marginBottom: 8 }}>Mover of the house list: <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{movers[0].symbol}</span> {parseFloat(movers[0].change) >= 0 ? "up" : "down"} {Math.abs(parseFloat(movers[0].change)).toFixed(2)}% on the day.</div>}
    {preds.length > 0 && <div style={{ marginBottom: 8 }}>
      {preds.map(p => { const q = BVT_QS.find(x => x.k === p.k); return <div key={p.k} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 11, padding: "2px 0" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: p.correct === undefined ? "#8a8072" : p.correct ? "#0d6d56" : "#b2342b", minWidth: 14 }}>{p.correct === undefined ? "…" : p.correct ? "✓" : "✗"}</span>
        <span style={{ color: "#4a443c" }}>{q ? q.q : p.k} <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: "#8a8072" }}>called {String(p.guess).toUpperCase()}{p.actual ? ` · tape says ${String(p.actual).toUpperCase()}` : " · awaiting data"}</span></span>
      </div>; })}
    </div>}
    {lessonFiled
      ? <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 1.5, textTransform: "uppercase" }}>Today's edition is put to bed ∎</div>
      : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={line} onChange={e => setLine(e.target.value)} onKeyDown={e => e.key === "Enter" && fileLesson()} placeholder="What did today teach? One sentence." style={{ ...S.input, flex: 1, minWidth: 200, fontSize: 12 }} />
          <button onClick={fileLesson} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 16px" }}>File & put to bed</button>
        </div>}
  </div>;
}

// ============ HERO + CMD ============
function Hero(){const[ph,setPh]=useState(0);useEffect(()=>{const timers=[setTimeout(()=>setPh(1),350),setTimeout(()=>setPh(2),1000),setTimeout(()=>setPh(3),1800),setTimeout(()=>setPh(4),2600)];return()=>timers.forEach(clearTimeout)},[]);return <div style={{position:"fixed",inset:0,background:"#faf3ea",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 1s ease",opacity:ph>=4?0:1,pointerEvents:ph>=4?"none":"all"}} onClick={()=>setPh(4)}><div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(13,109,86,0.06) 0%,transparent 70%)",animation:"breathe 4s ease-in-out infinite"}}/><div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(31,90,158,0.04) 0%,transparent 70%)",animation:"breathe 5s ease-in-out infinite",animationDelay:"1s",left:"35%",top:"55%"}}/><div style={{position:"absolute",top:0,left:0,right:0,height:10,background:"#2b2825"}}/><div style={{position:"absolute",top:10,left:0,right:0,height:2,background:"#0d6d56",transform:ph>=1?"scaleX(1)":"scaleX(0)",transition:"transform 1.2s cubic-bezier(0.4,0,0.2,1)"}}/><div style={{position:"relative",textAlign:"center"}}><div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#0d6d56",letterSpacing:8,textTransform:"uppercase",marginBottom:28,opacity:ph>=1?1:0,transform:`translateY(${ph>=1?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)"}}>masonjbennett.com</div><div style={{width:360,maxWidth:"72vw",margin:"0 auto 26px",borderTop:"1px solid #33302c",borderBottom:"1px solid #33302c",height:5,transform:ph>=2?"scaleX(1)":"scaleX(0)",transition:"transform 0.9s cubic-bezier(0.4,0,0.2,1)"}}/><h1 className="hero-name" style={{fontSize:72,fontWeight:400,fontFamily:"'Instrument Serif',serif",color:"#262421",lineHeight:1,marginBottom:18,opacity:ph>=2?1:0,transform:`translateY(${ph>=2?0:20}px) scale(${ph>=2?1:0.95})`,transition:"all 1s cubic-bezier(0.4,0,0.2,1)",letterSpacing:"-0.02em"}}>Mason J. Bennett</h1><p className="hero-sub" style={{fontSize:15,color:"#6f675c",letterSpacing:2,opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)",fontFamily:"'Space Grotesk',sans-serif"}}>M.S. Finance '26 · University of Arkansas · Dallas–Fort Worth, TX</p><div style={{width:60,margin:"26px auto 0",borderTop:"1px solid #0d6d56",transform:ph>=3?"scaleX(1)":"scaleX(0)",transition:"transform 0.8s cubic-bezier(0.4,0,0.2,1)"}}/><div style={{display:"flex",gap:16,marginTop:24,justifyContent:"center",opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s"}}>{["IB","PE","WM","CF"].map(t=><span key={t} style={{fontSize:10,padding:"4px 14px",borderRadius:20,border:"1px solid rgba(13,109,86,0.2)",color:"#0d6d56",fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,background:"rgba(13,109,86,0.05)"}}>{t}</span>)}</div></div><div style={{position:"absolute",bottom:36,fontSize:9,color:"#a2977f",fontFamily:"'JetBrains Mono',monospace",letterSpacing:3,textTransform:"uppercase",opacity:ph>=1&&ph<4?0.8:0,transition:"opacity 1.2s"}}>click anywhere to skip</div></div>;}
function Cmd({open,onClose,onNav}){const[q,setQ]=useState("");const ref=useRef();const items=[{l:"Home",t:"home"},{l:"Projects",t:"projects"},{l:"Markets",t:"markets"},{l:"News",t:"news"},...QLINKS.map(l=>({l:l.n,u:l.u}))];const f=items.filter(i=>i.l.toLowerCase().includes(q.toLowerCase()));useEffect(()=>{if(open&&ref.current){ref.current.focus();setQ("")}},[open]);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(51,48,46,0.45)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:100,animation:"fadeIn 0.15s"}} onClick={onClose}><div style={{background:"#fffdf9",border:"1px solid #d8c8b0",borderRadius:16,width:520,overflow:"hidden",boxShadow:"0 32px 80px rgba(64,52,32,0.14)"}} onClick={e=>e.stopPropagation()} className="cmd-modal"><div style={{padding:"16px 20px",borderBottom:"1px solid #e9ddc9",display:"flex",alignItems:"center",gap:12}}><span style={{color:"#0d6d56"}}>⌘</span><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{flex:1,background:"none",border:"none",outline:"none",color:"#33302c",fontSize:15}}/><kbd style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:"#e9ddc9",color:"#8a8072",border:"1px solid #d8c8b0",fontFamily:"'JetBrains Mono',monospace"}}>ESC</kbd></div><div style={{maxHeight:320,overflowY:"auto",padding:6}}>{f.map((item,i)=><button key={i} onClick={()=>{if(item.t)onNav(item.t);else window.open(item.u,"_blank");onClose()}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",background:"none",border:"none",color:"#33302c",fontSize:14,cursor:"pointer",borderRadius:10,textAlign:"left",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#e9ddc9"} onMouseLeave={e=>e.currentTarget.style.background="none"}><span style={{color:"#0d6d56",width:20,textAlign:"center"}}>→</span><span>{item.l}</span>{item.u&&<span style={{marginLeft:"auto",fontSize:10,color:"#8a8072"}}>↗</span>}</button>)}</div></div></div>;}

// ============ BRIEFINGS (compact) ============
function Briefings({apiKey}){const[morning,setMorning]=useState(null),[close,setClose]=useState(null),[vM,setVM]=useState(null),[vC,setVC]=useState(null),[swM,setSwM]=useState(null),[swC,setSwC]=useState(null),[lM,setLM]=useState(false),[lC,setLC]=useState(false),[vLM,setVLM]=useState(false),[vLC,setVLC]=useState(false),[swLM,setSwLM]=useState(false),[swLC,setSwLC]=useState(false),[tM,setTM]=useState(null),[tC,setTC]=useState(null),[showCl,setShowCl]=useState(false),[showSW,setShowSW]=useState(true),[err,setErr]=useState(""),[tab,setTab]=useState(()=>new Date().getHours()>=16?"close":"morning");const sugg=new Date().getHours()>=16?"close":"morning";
const gen=async(type,force=false)=>{if(!apiKey){setErr("Add your Anthropic API key in Settings to generate briefings.");return;}const sL=type==="morning"?setLM:setLC,sD=type==="morning"?setMorning:setClose,sT=type==="morning"?setTM:setTC,sV=type==="morning"?setVM:setVC,sSW=type==="morning"?setSwM:setSwC,sVL=type==="morning"?setVLM:setVLC,sSWL=type==="morning"?setSwLM:setSwLC;setErr("");sL(true);sV(null);sSW(null);const r=await fetchBriefing(type,apiKey,force);if(r){sD(r);sT(new Date())}else setErr("The wire didn't answer — check your key and connection, then try again.");sL(false);if(r?.text){sVL(true);const v=await verifyBriefing(r.text,apiKey);if(v)sV(v);sVL(false);sSWL(true);const sw=await fetchSoWhat(r.text,type,apiKey);if(sw)sSW(sw);sSWL(false)}};
const data=tab==="morning"?morning:close,loading=tab==="morning"?lM:lC,verifying=tab==="morning"?vLM:vLC,verify=tab==="morning"?vM:vC,soWhat=tab==="morning"?swM:swC,swLoad=tab==="morning"?swLM:swLC,time=tab==="morning"?tM:tC;
const SC={verified:"#0d6d56",minor_discrepancy:"#b0741e",unverified:"#b2342b"},SI={verified:"✓",minor_discrepancy:"~",unverified:"✗"},SL={verified:"Verified",minor_discrepancy:"Discrepancy",unverified:"Unverified"};
return <div style={{...S.card,background:"linear-gradient(135deg,#f6eee1,#fdf8f0,#f6eee1)",border:"1px solid rgba(13,109,86,0.1)",boxShadow:"0 12px 48px rgba(64,52,32,0.1), 0 0 40px rgba(13,109,86,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:`radial-gradient(circle,${tab==="morning"?"rgba(176,116,30,0.03)":"rgba(90,95,184,0.05)"} 0%,transparent 70%)`,pointerEvents:"none"}}/>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,position:"relative",flexWrap:"wrap",gap:12}}><div><div style={{display:"flex",gap:6,marginBottom:8}}>{["morning","close"].map(t=><button key={t} onClick={()=>setTab(t)} style={{fontSize:12,padding:"6px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,transition:"all 0.25s",border:"1px solid",display:"flex",alignItems:"center",gap:8,background:tab===t?(t==="morning"?"#b0741e10":"#56599e10"):"transparent",borderColor:tab===t?(t==="morning"?"#b0741e30":"#56599e30"):"#e9ddc9",color:tab===t?(t==="morning"?"#b0741e":"#56599e"):"#8a8072"}}><span style={{display:"inline-flex"}}>{t==="morning"?<SunIc/>:<MoonIc/>}</span>{t==="morning"?"Morning":"Close"} Brief{sugg===t&&<span style={{width:5,height:5,borderRadius:3,background:t==="morning"?"#b0741e":"#56599e",animation:"pulse 2s infinite"}}/>}</button>)}</div><p style={{color:"#8a8072",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>AI briefing → fact-check → implications {time?`· ${time.toLocaleTimeString()}`:""}</p></div><button onClick={()=>gen(tab,!!data)} disabled={loading||verifying} style={{...S.btn,opacity:(loading||verifying)?0.5:1}}>{loading?"⟳ Generating...":verifying||swLoad?"⟳ Analyzing...":data?"↻ Regenerate":"Generate Brief"}</button></div>
{err&&<p style={{fontSize:11,color:"#b2342b",marginBottom:12,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5}}>{err}</p>}
{!data&&!loading&&<div style={{textAlign:"center",padding:"36px 0"}}><div style={{marginBottom:12,opacity:0.2,display:"flex",justifyContent:"center",color:"#8a8072"}}>{tab==="morning"?<SunIc size={40}/>:<MoonIc size={40}/>}</div><p style={{color:"#6f675c",fontSize:13}}>{tab==="morning"?"Pre-market briefing with overnight futures, macro, and what to watch":"End-of-day summary with closes, movers, and tomorrow's catalysts"}</p></div>}
{loading&&<div style={{padding:"32px 0",textAlign:"center"}}><div style={{display:"inline-flex",gap:8}}>{[0,1,2,3].map(i=><div key={i} style={{width:7,height:7,borderRadius:4,background:tab==="morning"?"#b0741e":"#56599e",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}</div><p style={{color:"#8a8072",fontSize:12,marginTop:14,fontFamily:"'JetBrains Mono',monospace"}}>Step 1/3 — Searching & drafting...</p></div>}
{data&&<div>
{verifying&&!verify&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:"#b0741e06",border:"1px solid #b0741e12",marginBottom:12}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:3,background:"#b0741e",animation:"pulse 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div><span style={{color:"#b0741e",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Step 2/3 — Fact-checking...</span></div>}
{verify&&<div style={{padding:"10px 14px",borderRadius:10,background:"#f6eee1",border:"1px solid #e9ddc9",marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#8a8072",textTransform:"uppercase",letterSpacing:1.5}}>Verification</span><span style={{fontSize:11,padding:"2px 10px",borderRadius:20,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,background:verify.summary.confidence_pct>=80?"#0d6d5610":"#b0741e10",color:verify.summary.confidence_pct>=80?"#0d6d56":"#b0741e"}}>{verify.summary.confidence_pct}%</span></div><button onClick={()=>setShowCl(!showCl)} style={{background:"none",border:"1px solid #e9ddc9",borderRadius:6,color:"#8a8072",fontSize:10,padding:"3px 8px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{showCl?"Hide":"Show"} {verify.summary.total}</button></div><div style={{width:"100%",height:3,borderRadius:2,background:"#e9ddc9",overflow:"hidden",display:"flex"}}><div style={{width:`${(verify.summary.verified/verify.summary.total)*100}%`,background:"#0d6d56"}}/><div style={{width:`${(verify.summary.discrepancy/verify.summary.total)*100}%`,background:"#b0741e"}}/><div style={{width:`${(verify.summary.unverified/verify.summary.total)*100}%`,background:"#b2342b"}}/></div>{showCl&&verify.claims&&<div style={{display:"flex",flexDirection:"column",gap:3,marginTop:8}}>{verify.claims.map((c,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 8px",borderRadius:6,background:"#f6eee180"}}><span style={{color:SC[c.status],fontSize:12,fontWeight:700,width:16,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>{SI[c.status]}</span><div style={{flex:1}}><div style={{fontSize:11,color:"#33302c",lineHeight:1.4}}>{c.claim}</div>{c.note&&<div style={{fontSize:10,color:"#6f675c"}}>{c.note}</div>}</div><span style={{fontSize:8,padding:"2px 6px",borderRadius:8,fontFamily:"'JetBrains Mono',monospace",background:`${SC[c.status]}10`,color:SC[c.status],alignSelf:"flex-start"}}>{SL[c.status]}</span></div>)}</div>}</div>}
<div style={{color:"#4a443c",fontSize:13.5,lineHeight:1.8,marginBottom:16}}>{data.text.split(/\n\s*\n/).filter(Boolean).map((p,i,a)=><p key={i} style={{marginBottom:i<a.length-1?8:0}}>{p.trim()}</p>)}</div>
<SourceChips sources={data.sources}/>
{(soWhat||swLoad)&&<div style={{borderTop:"1px solid #e9ddc915",paddingTop:14,marginTop:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#7d5fb2",textTransform:"uppercase",letterSpacing:2}}>◆ So What?</span>{soWhat&&<button onClick={()=>setShowSW(!showSW)} style={{background:"none",border:"1px solid #e9ddc9",borderRadius:6,color:"#8a8072",fontSize:10,padding:"3px 8px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{showSW?"Collapse":"Expand"}</button>}</div>
{swLoad&&!soWhat&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:3,background:"#7d5fb2",animation:"pulse 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div><span style={{color:"#8a8072",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Step 3/3 — Implications...</span></div>}
{soWhat&&showSW&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{soWhat.map((item,i)=><div key={i} style={{padding:"12px 14px",borderRadius:10,background:"#f6eee1",border:"1px solid #e9ddc9",animation:"fadeUp 0.4s ease both",animationDelay:`${i*0.06}s`}}><div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}><span style={{color:"#7d5fb2",fontSize:10,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{String(i+1).padStart(2,"0")}</span><h4 style={{color:"#33302c",fontSize:14,fontWeight:600}}>{item.headline}</h4></div><div style={{paddingLeft:24}}><p style={{color:"#6f675c",fontSize:12,marginBottom:8,lineHeight:1.5}}>{item.development}</p>{[["WHY IT MATTERS","#0d6d56",item.why_it_matters],["WHO AFFECTED","#1f5a9e",item.who_affected],["SECOND ORDER","#b0741e",item.second_order]].map(([l,c,t])=><div key={l} style={{display:"flex",gap:8,marginBottom:5}}><span style={{color:c,fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,minWidth:80,flexShrink:0,paddingTop:2}}>{l}</span><span style={{color:"#4a443c",fontSize:12,lineHeight:1.5}}>{t}</span></div>)}<div style={{marginTop:8,padding:"6px 10px",borderRadius:6,background:"#7d5fb206",border:"1px solid #7d5fb212",display:"flex",alignItems:"baseline",gap:8}}><span style={{color:"#7d5fb2",fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>TAKEAWAY</span><span style={{color:"#33302c",fontSize:12,lineHeight:1.5}}>{item.takeaway}</span></div></div></div>)}</div>}
</div>}
</div>}
</div>;}

// ============ LBO SANDBOX ============
// ============ THE STANDING WIRE ============
// Keyless headline wire over api/rss.js (official public feeds; headline + link + attribution only).
const WIRE_STOP = new Set(["the", "a", "an", "of", "to", "in", "on", "for", "and", "as", "at", "by", "with", "after", "amid", "over", "is", "are", "its", "it", "from", "up", "down", "says", "say", "new", "will", "be", "has", "have", "was", "were", "this", "that", "their", "his", "her", "into", "out", "about", "more", "than", "how", "why", "what", "who", "could", "would", "should", "may", "might", "despite", "before", "during"]);
const wireTokens = t => new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length >= 2 && !WIRE_STOP.has(w)));
function clusterWire(items) {
  const sorted = [...items].sort((a, b) => (a.priority - b.priority) || (b.ts - a.ts));
  const toks = sorted.map(i => wireTokens(i.title));
  const clusters = [];
  sorted.forEach((it, i) => {
    let best = -1, bestScore = 0;
    clusters.forEach((c, ci) => {
      const a = toks[i], b = toks[c.lead];
      let inter = 0; a.forEach(w => { if (b.has(w)) inter++; });
      const overlap = inter / (Math.min(a.size, b.size) || 1);
      if (inter >= 3 && overlap >= 0.5 && overlap > bestScore) { bestScore = overlap; best = ci; }
    });
    if (best >= 0) clusters[best].also.push(i);
    else clusters.push({ lead: i, also: [] });
  });
  return clusters.map(c => ({ lead: sorted[c.lead], also: c.also.map(i => sorted[i]) }))
    .sort((a, b) => Math.max(b.lead.ts, ...b.also.map(x => x.ts)) - Math.max(a.lead.ts, ...a.also.map(x => x.ts)));
}
const wireAgo = ts => { if (!ts) return ""; const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };
// Reading-diet log for the Circulation Audit: which sources Mason actually clicks (ring buffer, local only)
function logRead(it) { const r = lsGet("mjb_reads", []); r.push({ d: todayISO(), label: it.label }); if (r.length > 500) r.splice(0, r.length - 500); lsSet("mjb_reads", r); }
function clipHeadline(it) {
  const c = lsGet("mjb_clippings", []);
  if (c.some(x => x.link === it.link)) return;
  c.unshift({ title: it.title, link: it.link, label: it.label, d: todayISO(), note: "" });
  if (c.length > 100) c.length = 100;
  lsSet("mjb_clippings", c);
  learnPing();
}
function ClippingsBoard() {
  useLearnTick();
  const items = lsGet("mjb_clippings", []);
  const save = (i, note) => { const c = lsGet("mjb_clippings", []); if (c[i]) { c[i] = { ...c[i], note }; lsSet("mjb_clippings", c); } };
  const drop = i => { const c = lsGet("mjb_clippings", []); c.splice(i, 1); lsSet("mjb_clippings", c); learnPing(); };
  if (!items.length) return null;
  return <div style={{ borderTop: "1px solid #ddcfb8", marginTop: 12, paddingTop: 10 }}>
    <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Clippings — the editor's file</div>
    {items.slice(0, 6).map((c, i) => <div key={c.link} style={{ padding: "6px 0", borderTop: i ? "1px solid #efe4d2" : "none" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: "#33302c", textDecoration: "none", flex: 1, lineHeight: 1.5 }}>{c.title}</a>
        <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{c.label} · {c.d}</span>
        <button onClick={() => drop(i)} title="Discard clipping" style={{ background: "none", border: "none", cursor: "pointer", color: "#b2342b", fontSize: 10, padding: 0 }}>×</button>
      </div>
      <input defaultValue={c.note} onBlur={e => save(i, e.target.value.trim())} placeholder="Marginalia — why this one mattered…" style={{ ...S.input, fontSize: 10.5, padding: "3px 7px", fontStyle: "italic", background: "transparent", border: "none", borderBottom: "1px dotted #ddcfb8", borderRadius: 0 }} />
    </div>)}
    {items.length > 6 && <div style={{ fontSize: 9, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", marginTop: 6 }}>+ {items.length - 6} more in the file</div>}
  </div>;
}
function StandingWire({ desk }) {
  const [wire, setWire] = useState(null);
  const [mode, setMode] = useState("front");
  const [prefs, setPrefs] = useState(() => lsGet("mjb_wire_prefs", { priority: [], muted: [] }));
  const [prefsOpen, setPrefsOpen] = useState(false);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_wire", 10); if (cached) { if (on) setWire(cached); return; }
        const r = await fetch("/api/rss");
        if (!r.ok) return;
        const d = await r.json();
        if (d.items && d.items.length && on) { setWire(d); cacheSet("mjb_wire", d); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  if (!wire) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>The always-on headline wire — Reuters, WSJ, CNBC, MarketWatch, and Yahoo Finance, clustered one story per line, no key required.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>AWAITING WIRE — live in production</span></p>;
  const savePrefs = patch => setPrefs(p => { const next = { ...p, ...patch }; lsSet("mjb_wire_prefs", next); return next; });
  const mut = (prefs.muted || []).map(s => s.toLowerCase()).filter(Boolean);
  const pri = (prefs.priority || []).map(s => s.toLowerCase()).filter(Boolean);
  const isPri = t => pri.some(k => t.toLowerCase().includes(k));
  const seen = new Set();
  const items = wire.items
    .filter(x => !mut.some(k => x.title.toLowerCase().includes(k)))
    .filter(x => { const k = x.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const Head = ({ it, size = 15 }) => <a href={it.link} target="_blank" rel="noopener noreferrer" onClick={() => logRead(it)} style={{ fontFamily: "'Instrument Serif',serif", fontSize: size, color: "#262421", textDecoration: "none", lineHeight: 1.35 }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#262421"}>{it.title}{it.paywall && <sup style={{ fontSize: 9, color: "#b0741e" }}> †</sup>}</a>;
  const Clip = ({ it }) => desk ? <button onClick={() => clipHeadline(it)} title="Clip for the editor's file" style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8072", fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: 0, textDecoration: "underline dotted", textUnderlineOffset: 2 }}>CLIP</button> : null;
  let body;
  if (mode === "front") {
    const clusters = clusterWire(items);
    const ordered = [...clusters.filter(c => isPri(c.lead.title)), ...clusters.filter(c => !isPri(c.lead.title))];
    body = ordered.slice(0, 16).map((c, i) => <div key={c.lead.link} style={{ borderTop: i ? "1px solid #efe4d2" : "none", padding: "9px 2px", borderLeft: isPri(c.lead.title) ? "2px solid #0d6d56" : "2px solid transparent", paddingLeft: 8 }}>
      <Head it={c.lead} />
      <div style={{ fontSize: 8.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", marginTop: 3, letterSpacing: 0.5, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
        <span style={{ color: "#8a8072", fontWeight: 600 }}>{c.lead.label}</span>
        <span>{wireAgo(c.lead.ts)}</span>
        {c.also.length > 0 && <span>also: {c.also.slice(0, 4).map((a, j) => <a key={a.link} href={a.link} target="_blank" rel="noopener noreferrer" onClick={() => logRead(a)} style={{ color: "#6f675c", textDecoration: "underline dotted", textUnderlineOffset: 2 }}>{a.label}{j < Math.min(c.also.length, 4) - 1 ? " · " : ""}</a>)}</span>}
        {c.also.length === 0 && c.lead.ts > Date.now() - 6 * 3600000 && <span style={{ color: "#990f3d", letterSpacing: 1.5 }}>SOLE SOURCE</span>}
        <Clip it={c.lead} />
      </div>
    </div>);
  } else {
    body = [...items].sort((a, b) => b.ts - a.ts).slice(0, 40).map((it, i) => <div key={it.link} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "5px 2px", borderTop: i ? "1px solid #efe4d2" : "none" }}>
      <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, minWidth: 52 }}>{wireAgo(it.ts)}</span>
      <span style={{ fontSize: 8.5, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, minWidth: 84, letterSpacing: 0.5 }}>{it.label}</span>
      <span style={{ flex: 1 }}><Head it={it} size={12.5} /></span>
      <Clip it={it} />
    </div>);
  }
  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
      {[["front", "Front Page"], ["river", "The River"]].map(([k, l]) => <button key={k} onClick={() => setMode(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", color: mode === k ? "#0d6d56" : "#a2977f", borderBottom: mode === k ? "1px solid #0d6d56" : "1px solid transparent" }}>{l}</button>)}
      {desk && <button onClick={() => setPrefsOpen(!prefsOpen)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8072", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>Wire desk {prefsOpen ? "▴" : "▾"}</button>}
    </div>
    {prefsOpen && desk && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, padding: "8px 10px", background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 8 }}>
      {[["priority", "Priority keywords — float to the top"], ["muted", "Muted keywords — silently dropped"]].map(([k, ph]) => <input key={k} defaultValue={(prefs[k] || []).join(", ")} onBlur={e => savePrefs({ [k]: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder={ph} style={{ ...S.input, flex: 1, minWidth: 220, fontSize: 10.5, padding: "6px 9px", fontFamily: "'JetBrains Mono',monospace" }} />)}
    </div>}
    {body}
    {desk && <ClippingsBoard />}
    <SourceLine>Sources: Reuters (via Google News) · WSJ† · CNBC · MarketWatch · Yahoo Finance · headlines link to the publisher · † subscription · 10-min cache</SourceLine>
  </div>;
}

// The Reading Ledger: latest issue titles from the newsletter rack (Substack /feed convention).
// Titles + links only — reading happens at the publisher.
function ReadingLedger() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_letters", 60); if (cached) { if (on) setItems(cached); return; }
        const r = await fetch("/api/rss?src=netinterest,klement,transcript,apricitas");
        if (!r.ok) return;
        const d = await r.json();
        if (d.items && d.items.length && on) { setItems(d.items); cacheSet("mjb_letters", d.items); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  if (!items) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>The serious-reading rack — latest issues of Net Interest, Klement on Investing, The Transcript, and Apricitas, straight from their feeds.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>Live in production</span></p>;
  const pubs = {};
  items.forEach(x => { (pubs[x.label] = pubs[x.label] || []).push(x); });
  const rows = Object.entries(pubs)
    .map(([label, xs]) => ({ label, latest: [...xs].sort((a, b) => b.ts - a.ts).slice(0, 2) }))
    .filter(p => p.latest[0] && p.latest[0].ts > Date.now() - 60 * 86400000)
    .sort((a, b) => b.latest[0].ts - a.latest[0].ts);
  return <div>
    {rows.map((p, i) => <div key={p.label} style={{ borderTop: i ? "1px solid #efe4d2" : "none", padding: "9px 2px" }}>
      <div style={{ fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", color: "#1f5a9e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>{p.label}</div>
      {p.latest.map((x, j) => <div key={x.link} style={{ display: "flex", gap: 8, alignItems: "baseline", marginTop: j ? 3 : 0 }}>
        <a href={x.link} target="_blank" rel="noopener noreferrer" onClick={() => logRead(x)} style={{ fontFamily: j ? "'Space Grotesk',sans-serif" : "'Instrument Serif',serif", fontSize: j ? 11 : 14.5, color: j ? "#6f675c" : "#262421", textDecoration: "none", lineHeight: 1.4, flex: 1 }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = j ? "#6f675c" : "#262421"}>{x.title}</a>
        <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{wireAgo(x.ts)}</span>
      </div>)}
    </div>)}
    <SourceLine>Substack public feeds · issue titles link to the publication · dormant racks auto-hide after 60 days</SourceLine>
  </div>;
}

// Circulation Audit: the reader audited — source mix of Mason's own clicks, last 30 days. Desk-only.
function CirculationAudit() {
  const reads = lsGet("mjb_reads", []);
  const cut = addDaysISO(-30);
  const recent = reads.filter(x => x.d >= cut);
  if (recent.length < 5) return null;
  const tally = {};
  recent.forEach(x => { tally[x.label] = (tally[x.label] || 0) + 1; });
  const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const top = rows[0], topShare = top[1] / recent.length;
  const wireLabels = ["Reuters", "WSJ Markets", "CNBC", "MarketWatch", "Yahoo Finance"];
  const untouched = wireLabels.filter(l => !tally[l]);
  return <div style={{ ...S.card, marginTop: 16 }}>
    <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Circulation Audit<Info text="The reader, audited: which sources you actually clicked over the last 30 days, computed from this browser's own click log. Flags single-source drift and untouched outlets. Private to you." /></h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 22px" }}>
      {rows.map(([label, n]) => <span key={label} style={{ display: "inline-flex", gap: 7, alignItems: "baseline", fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5 }}>
        <span style={{ color: "#8a8072", fontSize: 8.5, letterSpacing: 1 }}>{label}</span>
        <span style={{ color: "#33302c" }}>{Math.round(n / recent.length * 100)}%</span>
      </span>)}
    </div>
    {(topShare > 0.6 || untouched.length > 0) && <div style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.7 }}>
      {topShare > 0.6 && <div style={{ color: "#990f3d" }}>Single-source drift: {Math.round(topShare * 100)}% of your reading is {top[0]}.</div>}
      {untouched.length > 0 && <div style={{ color: "#b0741e" }}>Untouched this month: {untouched.join(" · ")}.</div>}
    </div>}
    <SourceLine>{recent.length} clicks in the last 30 days · logged in this browser only · export via localStorage mjb_reads</SourceLine>
  </div>;
}

// Today's Desk: the editor's budget line — one focus, up to three items, resets daily with held-over carry. Desk-only.
function TodaysDesk() {
  const [st, setSt] = useState(() => {
    const t = todayISO(); const s = lsGet("mjb_desk_budget", null);
    if (s && s.d === t) return s;
    return { d: t, focus: "", todos: (s ? s.todos.filter(x => !x.done).map(x => ({ ...x, held: true })) : []).slice(0, 3) };
  });
  const [draft, setDraft] = useState("");
  const save = next => { setSt(next); lsSet("mjb_desk_budget", next); };
  return <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", padding: "9px 20px", border: "1px solid #e3d5bf", borderRadius: 10, background: "rgba(255,253,249,0.75)", marginBottom: 16 }}>
    <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#b0741e", letterSpacing: 3, textTransform: "uppercase", flexShrink: 0 }}>Today's Desk</span>
    <input value={st.focus} onChange={e => save({ ...st, focus: e.target.value })} placeholder="The main thing today —" style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Instrument Serif',serif", fontSize: 14.5, fontStyle: st.focus ? "normal" : "italic", color: "#262421", flex: 1, minWidth: 180 }} />
    {st.todos.map((x, i) => <button key={i} onClick={() => { const todos = [...st.todos]; todos[i] = { ...x, done: !x.done }; save({ ...st, todos }); }} title={x.done ? "Reopen" : "Strike through"} style={{ background: "none", border: "1px solid #e9ddc9", borderRadius: 8, padding: "3px 10px", cursor: "pointer", fontSize: 10, color: x.done ? "#a2977f" : "#4a443c", textDecoration: x.done ? "line-through" : "none", fontFamily: "'Space Grotesk',sans-serif" }}>{x.t}{x.held && !x.done ? " (held over)" : ""}</button>)}
    {st.todos.length < 3 && <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { save({ ...st, todos: [...st.todos, { t: draft.trim().slice(0, 60), done: false }] }); setDraft(""); } }} placeholder="+ item" style={{ ...S.input, width: 90, fontSize: 10, padding: "4px 8px", background: "transparent" }} />}
  </div>;
}

// NOTICES: overnight alert column — rules evaluated against the quotes already fetched. Desk-only.
function Notices({ prices, live }) {
  const [, force] = useState(0);
  const [form, setForm] = useState({ t: "", type: "above", v: "" });
  useEffect(() => {
    if (!live || !prices || !prices.length) return;
    const rls = lsGet("mjb_alerts", []);
    if (!rls.length) return;
    const log = lsGet("mjb_notices", []);
    let changed = false;
    rls.forEach(r => {
      const p = prices.find(x => x.symbol === r.t);
      if (!p || p.price === "—") return;
      const c = parseFloat(p.price), dp = parseFloat(p.change);
      const hit = r.type === "above" ? c >= r.v : r.type === "below" ? c <= r.v : Math.abs(dp) >= r.v;
      const key = `${r.t}:${r.type}:${r.v}:${todayISO()}`;
      if (hit && !log.some(n => n.key === key)) {
        log.unshift({ key, d: todayISO(), text: r.type === "move" ? `${r.t} has moved ${Math.abs(dp).toFixed(2)}% today — rule was ±${r.v}%` : `${r.t} at $${c.toFixed(2)} — crossed ${r.type} $${r.v}`, dismissed: false });
        changed = true;
      }
    });
    if (changed) { if (log.length > 60) log.length = 60; lsSet("mjb_notices", log); force(x => x + 1); }
  }, [prices, live]);
  const rules = lsGet("mjb_alerts", []);
  const open = lsGet("mjb_notices", []).filter(n => !n.dismissed);
  const dismiss = key => { const log = lsGet("mjb_notices", []); const i = log.findIndex(n => n.key === key); if (i >= 0) { log[i] = { ...log[i], dismissed: true }; lsSet("mjb_notices", log); force(x => x + 1); } };
  const addRule = () => { const t = form.t.trim().toUpperCase(); const v = parseFloat(form.v); if (!/^[A-Z.]{1,10}$/.test(t) || isNaN(v) || v <= 0) return; const rls = lsGet("mjb_alerts", []); rls.push({ t, type: form.type, v }); lsSet("mjb_alerts", rls); setForm({ t: "", type: form.type, v: "" }); force(x => x + 1); };
  const delRule = i => { const rls = lsGet("mjb_alerts", []); rls.splice(i, 1); lsSet("mjb_alerts", rls); force(x => x + 1); };
  return <div>
    {open.length > 0 && <div style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -4, borderRadius: 2, padding: "12px 14px", marginBottom: 12, background: "#fffdf9" }}>
      <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#990f3d", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Notices</div>
      {open.map(n => <div key={n.key} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0" }}>
        <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{n.d}</span>
        <span style={{ fontSize: 12, color: "#33302c", flex: 1, fontFamily: "'JetBrains Mono',monospace" }}>{n.text}</span>
        <button onClick={() => dismiss(n.key)} title="Mark read" style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8072", fontSize: 11, padding: 0 }}>×</button>
      </div>)}
    </div>}
    {rules.map((r, i) => <div key={`${r.t}${r.type}${r.v}`} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "4px 2px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
      <span style={{ color: "#33302c", fontWeight: 600, minWidth: 44 }}>{r.t}</span>
      <span style={{ color: "#6f675c", flex: 1 }}>{r.type === "move" ? `alert on a daily move ≥ ${r.v}%` : `alert ${r.type} $${r.v}`}</span>
      <button onClick={() => delRule(i)} title="Remove rule" style={{ background: "none", border: "none", cursor: "pointer", color: "#b2342b", fontSize: 10, padding: 0 }}>×</button>
    </div>)}
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: rules.length ? 8 : 0 }}>
      <input value={form.t} onChange={e => setForm({ ...form, t: e.target.value })} placeholder="Ticker" style={{ ...S.input, width: 70, fontSize: 10.5, padding: "5px 8px", fontFamily: "'JetBrains Mono',monospace" }} />
      <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...S.input, width: "auto", fontSize: 10.5, padding: "5px 8px", fontFamily: "'JetBrains Mono',monospace" }}>
        <option value="above">crosses above $</option>
        <option value="below">crosses below $</option>
        <option value="move">daily move ≥ %</option>
      </select>
      <input value={form.v} onChange={e => setForm({ ...form, v: e.target.value })} placeholder="Value" style={{ ...S.input, width: 70, fontSize: 10.5, padding: "5px 8px", fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }} />
      <button onClick={addRule} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "5px 14px" }}>File rule</button>
    </div>
    <SourceLine>Checked on page load against the live tape · fired notices persist until marked read · rules stay in this browser</SourceLine>
  </div>;
}

// Damodaran sector anchors — loaded lazily from /damodaran-2026.json (data used with attribution;
// refreshed each January alongside the econ-json chore)
let DAMO_CACHE = null;
function useDamodaran() {
  const [d, setD] = useState(DAMO_CACHE);
  useEffect(() => {
    if (DAMO_CACHE) return;
    let on = true;
    (async () => { try { const r = await fetch("/damodaran-2026.json"); if (!r.ok) return; const j = await r.json(); if (j && j.industries) { DAMO_CACHE = j; if (on) setD(j); } } catch {} })();
    return () => { on = false; };
  }, []);
  return d;
}
function SectorReference({ exit }) {
  const d = useDamodaran();
  const [sector, setSector] = useState("Software (System & Application)");
  if (!d) return null;
  const row = d.industries.find(x => x.name === sector);
  if (!row) return null;
  const diff = exit - row.evEbitda;
  const inline = Math.abs(diff) < 0.75;
  return <div style={{ borderTop: "1px solid #e9ddc9", marginTop: 16, paddingTop: 10 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", flexShrink: 0 }}>Sector reference</span>
      <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...S.input, width: "auto", maxWidth: 240, fontSize: 10, padding: "4px 8px", fontFamily: "'JetBrains Mono',monospace" }}>
        {d.industries.map(x => <option key={x.name} value={x.name}>{x.name}</option>)}
      </select>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#33302c", fontWeight: 600 }}>{row.evEbitda.toFixed(1)}x EV/EBITDA</span>
      <span style={{ fontSize: 10.5, color: inline ? "#0d6d56" : diff > 0 ? "#990f3d" : "#0d6d56" }}>
        {inline ? "your exit is in line with the sector" : `your exit at ${exit.toFixed(1)}x is ${Math.abs(diff).toFixed(1)} turns ${diff > 0 ? "above" : "below"} the sector`}
      </span>
    </div>
    <div style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", marginTop: 6, letterSpacing: 0.5 }}>Data: A. Damodaran, NYU Stern · {d.asOf} · aggregate multiples over positive-EBITDA firms ({row.firms} firms in this group)</div>
  </div>;
}

function LBOSandbox() {
  const [inp, setInp] = useState({ entry: 10, debt: 60, growth: 6, exit: 10, years: 5 });
  const [scen, setScen] = useState(null);
  const animRef = useRef(null);
  const set = k => e => { setScen(null); setInp(p => ({ ...p, [k]: parseFloat(e.target.value) })); };
  const SCENARIOS = {
    Base: { v: { entry: 10, debt: 60, growth: 6, exit: 10, years: 5 }, note: "Steady growth at a flat exit multiple — returns come from EBITDA growth and debt paydown." },
    Upside: { v: { entry: 9.5, debt: 65, growth: 9, exit: 11.5, years: 5 }, note: "Cheaper entry, faster growth, and multiple expansion — all three levers pulling at once." },
    Downside: { v: { entry: 10.5, debt: 55, growth: 2, exit: 8.5, years: 5 }, note: "Slow growth into multiple compression — deleveraging alone can't carry the deal." },
  };
  const runScenario = (name) => {
    setScen(name);
    const target = SCENARIOS[name].v, start = { ...inp }, t0 = performance.now();
    cancelAnimationFrame(animRef.current);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 650), ez = 1 - Math.pow(1 - k, 3);
      setInp({ entry: +(start.entry + (target.entry - start.entry) * ez).toFixed(1), debt: Math.round(start.debt + (target.debt - start.debt) * ez), growth: +(start.growth + (target.growth - start.growth) * ez).toFixed(1), exit: +(start.exit + (target.exit - start.exit) * ez).toFixed(1), years: Math.round(start.years + (target.years - start.years) * ez) });
      if (k < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };
  const E0 = 100, EV0 = inp.entry * E0, D0 = EV0 * inp.debt / 100, Q0 = EV0 - D0;
  const EN = E0 * Math.pow(1 + inp.growth / 100, inp.years);
  let debt = D0;
  for (let y = 1; y <= inp.years; y++) debt = Math.max(0, debt - 0.45 * E0 * Math.pow(1 + inp.growth / 100, y));
  const EVN = inp.exit * EN, QN = EVN - debt;
  const mom = QN / Q0, irr = mom > 0 ? (Math.pow(mom, 1 / inp.years) - 1) * 100 : -100;
  const bridge = [
    ["EBITDA growth", inp.entry * (EN - E0), "#0d6d56"],
    ["Multiple expansion", (inp.exit - inp.entry) * EN, "#1f5a9e"],
    ["Deleveraging", D0 - debt, "#b0741e"],
  ];
  const maxAbs = Math.max(...bridge.map(([, v]) => Math.abs(v)), 1);
  const sliders = [
    ["Entry multiple", "entry", 6, 16, 0.5, v => `${v.toFixed(1)}x EBITDA`],
    ["Debt financing", "debt", 30, 80, 5, v => `${v}% of EV`],
    ["EBITDA growth", "growth", 0, 15, 0.5, v => `${v.toFixed(1)}% / yr`],
    ["Exit multiple", "exit", 6, 16, 0.5, v => `${v.toFixed(1)}x EBITDA`],
    ["Hold period", "years", 3, 7, 1, v => `${v} years`],
  ];
  return <div>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: "#6f675c", fontStyle: "italic", marginBottom: 8 }}>How the five levers of an LBO drive returns — press a scenario to test.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(SCENARIOS).map(n => <button key={n} onClick={() => runScenario(n)} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "6px 16px", ...(scen === n ? { background: "#0d6d56", color: "#fdf8f0", border: "1px solid #0d6d56" } : {}) }}>{n}</button>)}
      </div>
      {scen && <div style={{ fontSize: 11.5, color: "#4a443c", marginTop: 10, fontStyle: "italic", borderLeft: "2px solid #0d6d56", paddingLeft: 10, lineHeight: 1.6 }}>{SCENARIOS[scen].note} <span style={{ color: "#0d6d56", fontWeight: 600, fontStyle: "normal", fontFamily: "'JetBrains Mono',monospace" }}>→ {irr.toFixed(1)}% IRR · {mom.toFixed(2)}x</span></div>}
    </div>
    <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sliders.map(([label, k, min, max, step, fmt]) => <div key={k}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#6f675c", fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 11, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(inp[k])}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={inp[k]} onChange={set(k)} style={{ width: "100%", cursor: "pointer" }} />
        </div>)}
      </div>
      <div>
        <div style={{ display: "flex", gap: 28, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 36, fontFamily: "'Instrument Serif',serif", color: irr >= 0 ? "#0d6d56" : "#b2342b", lineHeight: 1 }}>{irr.toFixed(1)}%</div>
            <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 }}>Gross IRR</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontFamily: "'Instrument Serif',serif", color: "#262421", lineHeight: 1 }}>{mom.toFixed(2)}x</div>
            <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 }}>MoM</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#6f675c", marginBottom: 14, fontFamily: "'JetBrains Mono',monospace" }}>Sponsor equity: ${Q0.toFixed(0)}M → ${QN.toFixed(0)}M</div>
        <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Value-Creation Bridge</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {bridge.map(([label, v, c]) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#6f675c", minWidth: 118 }}>{label}</span>
            <div style={{ flex: 1, height: 10, background: "#f6eee1", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.abs(v) / maxAbs * 100)}%`, height: "100%", background: v >= 0 ? c : "#b2342b", borderRadius: 5, transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: v >= 0 ? c : "#b2342b", minWidth: 58, textAlign: "right", fontWeight: 600 }}>{v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}M</span>
          </div>)}
        </div>
      </div>
    </div>
    <SectorReference exit={inp.exit} />
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 16, lineHeight: 1.6 }}>Simplified and illustrative — $100M entry EBITDA (indexed), 45% of EBITDA converts to debt paydown annually, no fees or taxes. Built to demonstrate LBO mechanics, not investment advice.</p>
  </div>;
}

// ============ HCA FOOTBALL FIELD ============
function FootballField() {
  const ROWS = [
    { m: "EPS multiple · 16x–20x", lo: 428, hi: 537, base: 482, c: "#1f5a9e" },
    { m: "DCF · exit multiple 6x–10x", lo: 497, hi: 737, base: 612, c: "#0d6d56" },
    { m: "DCF · Gordon growth", lo: 555, hi: 602, base: 578, c: "#6d549e" },
  ];
  const PT = 557.26, PITCH = 466.58;
  const [live, setLive] = useState(null);
  useEffect(() => {
    let c = false;
    (async () => { try { const cached = cacheGet("mb_hca_live", 5); if (cached) { if (!c) setLive(cached); return; } const r = await fetch("/api/quotes?symbols=HCA"); if (!r.ok) return; const d = await r.json(); if (d.HCA && d.HCA.c && !c) { setLive(d.HCA.c); cacheSet("mb_hca_live", d.HCA.c); } } catch {} })();
    return () => { c = true; };
  }, []);
  const vals = [400, 760, PT, PITCH, ...(live ? [live] : [])];
  const lo = Math.min(...vals) - 15, hi = Math.max(...vals) + 15;
  const x = v => `${((v - lo) / (hi - lo)) * 100}%`;
  const Rule = ({ v, color, dash, label, top }) => <div style={{ position: "absolute", left: x(v), top: 0, bottom: 0, width: 0, borderLeft: `1px ${dash ? "dashed" : "solid"} ${color}` }}>
    <span style={{ position: "absolute", top: top ? -16 : "100%", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color, letterSpacing: 0.5, marginTop: top ? 0 : 3 }}>{label}</span>
  </div>;
  return <div>
    <div style={{ position: "relative", padding: "22px 8px 26px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
        {ROWS.map(r => <div key={r.m} style={{ position: "relative" }}>
          <div style={{ fontSize: 10, color: "#6f675c", marginBottom: 4 }}>{r.m}</div>
          <div style={{ position: "relative", height: 16 }}>
            <div style={{ position: "absolute", top: 7, left: 0, right: 0, height: 1, background: "#efe4d2" }} />
            <div style={{ position: "absolute", left: x(r.lo), width: `calc(${x(r.hi)} - ${x(r.lo)})`, top: 1, height: 13, background: `${r.c}1f`, border: `1px solid ${r.c}66`, borderRadius: 2 }} />
            <div style={{ position: "absolute", left: x(r.base), top: 0, width: 2, height: 15, background: r.c }} title={`Base $${r.base}`} />
            <span style={{ position: "absolute", left: x(r.lo), top: -1, transform: "translateX(-104%)", fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072" }}>${r.lo}</span>
            <span style={{ position: "absolute", left: x(r.hi), top: -1, transform: "translateX(6%)", fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072" }}>${r.hi}</span>
          </div>
        </div>)}
        <Rule v={PT} color="#0d6d56" dash label={`PT $${PT.toFixed(0)}`} top />
        <Rule v={PITCH} color="#b8ab97" dash label={`$${PITCH.toFixed(0)} at pitch`} />
        {live && <Rule v={live} color="#262421" label={`live $${live.toFixed(0)}`} top={false} />}
      </div>
    </div>
    <p style={{ fontSize: 9, color: "#a2977f", lineHeight: 1.6 }}>Ranges from the team's sensitivity tables (5.8%–7.8% discount rate). Student pitch — assumptions as of Oct 30, 2025{live ? " · live price updates daily" : ""}. Not investment advice.</p>
  </div>;
}

// ============ MERGER MATH ============
function MergerMath() {
  const A = { ni: 500, sh: 200, pe: 15 }, B = { ni: 150, peStand: 12 }, TAX = 0.21;
  const [inp, setInp] = useState({ prem: 25, stock: 50, kd: 6, syn: 50 });
  const set = k => e => setInp(p => ({ ...p, [k]: parseFloat(e.target.value) }));
  const epsA = A.ni / A.sh, priceA = epsA * A.pe;
  const offer = B.ni * B.peStand * (1 + inp.prem / 100);
  const stockVal = offer * inp.stock / 100, debtVal = offer - stockVal;
  const newSh = stockVal / priceA;
  const atInt = debtVal * (inp.kd / 100) * (1 - TAX);
  const pfNI = A.ni + B.ni + inp.syn * (1 - TAX) - atInt;
  const pfSh = A.sh + newSh;
  const pfEPS = pfNI / pfSh;
  const acc = (pfEPS / epsA - 1) * 100;
  const breakeven = Math.max(0, (epsA * pfSh - A.ni - B.ni + atInt) / (1 - TAX));
  const sliders = [
    ["Premium to standalone", "prem", 0, 60, 5, v => `${v}%`],
    ["Consideration mix", "stock", 0, 100, 10, v => `${v}% stock · ${100 - v}% debt`],
    ["Cost of debt", "kd", 3, 9, 0.5, v => `${v.toFixed(1)}%`],
    ["Pre-tax synergies", "syn", 0, 300, 10, v => `$${v}M`],
  ];
  return <div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
      {sliders.map(([label, k, min, max, step, fmt]) => <div key={k}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "#6f675c", fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 11, color: "#1f5a9e", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt(inp[k])}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={inp[k]} onChange={set(k)} style={{ width: "100%", cursor: "pointer", accentColor: "#1f5a9e" }} />
      </div>)}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
      <span style={{ fontSize: 32, fontFamily: "'Instrument Serif',serif", color: acc >= 0 ? "#0d6d56" : "#b2342b", lineHeight: 1 }}>{acc >= 0 ? "+" : "−"}{Math.abs(acc).toFixed(1)}%</span>
      <span style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>{acc >= 0 ? "Accretive" : "Dilutive"}</span>
    </div>
    <div style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>Pro-forma EPS ${pfEPS.toFixed(2)} vs ${epsA.toFixed(2)} standalone</div>
    <div style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>Breakeven synergies: ${breakeven.toFixed(0)}M pre-tax</div>
    <div style={{ fontSize: 11.5, color: "#4a443c", fontStyle: "italic", borderLeft: "2px solid #1f5a9e", paddingLeft: 10, lineHeight: 1.6 }}>
      {inp.stock === 100 ? "All-stock" : inp.stock === 0 ? "All-debt" : `A ${inp.stock}% stock deal`} at a {inp.prem}% premium is {acc >= 0 ? "accretive from day one." : `dilutive until roughly $${breakeven.toFixed(0)}M of pre-tax synergies.`}
    </div>
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>Hypothetical companies — Acquirer: $500M net income, 200M shares, 15.0x P/E ($37.50). Target: $150M net income, 12.0x standalone. 21% tax; simplified (no fees, amortization, or balance-sheet cash).</p>
  </div>;
}

// ============ PUZZLE CORNER ============
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ============ LEARNING SPINE ============
// Shared attempt log + SM-2 review queue + errata ledger + edition streak.
// All state lives in localStorage (mjb_*); the Docket/Errata/Edition ledgers only render in Desk mode.
const NYSE_HOLIDAYS_2026 = ["2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25"]; // refresh with the January econ-json chore
const toISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => toISO(new Date());
const addDaysISO = n => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d); };
const isTradingDay = d => { const w = d.getDay(); return w !== 0 && w !== 6 && !NYSE_HOLIDAYS_2026.includes(toISO(d)); };
const weekKey = d => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return toISO(m); };
function lastTradingDays(n) { const out = [], d = new Date(); while (out.length < n) { if (isTradingDay(d)) out.push(toISO(d)); d.setDate(d.getDate() - 1); } return out; }
function lsGet(k, f) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch { return f; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
const learnPing = () => { try { window.dispatchEvent(new Event("mjb-learn")); } catch {} };
function useLearnTick() { const [, s] = useState(0); useEffect(() => { const h = () => s(x => x + 1); window.addEventListener("mjb-learn", h); return () => window.removeEventListener("mjb-learn", h); }, []); }
// SM-2 (public-domain algorithm). q: 1 = missed, 3 = shaky, 5 = solid.
function sm2(card, q) {
  const c = { ...card };
  if (q >= 3) { c.reps = (c.reps || 0) + 1; c.ivl = c.reps === 1 ? 1 : c.reps === 2 ? 6 : Math.round((c.ivl || 1) * c.ef); }
  else { c.reps = 0; c.ivl = 1; c.lapses = (c.lapses || 0) + 1; }
  c.ef = Math.max(1.3, c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  c.due = addDaysISO(c.ivl);
  return c;
}
function upsertCard(id, front, back, from, q) {
  const cards = lsGet("mjb_srs", []);
  const i = cards.findIndex(x => x.id === id);
  if (i < 0) cards.push(sm2({ id, front, back, from, ef: 2.5, reps: 0, ivl: 0, lapses: 0 }, q));
  else cards[i] = sm2(cards[i], q);
  lsSet("mjb_srs", cards);
}
function recordEdition(via) { const ed = lsGet("mjb_editions", {}); const t = todayISO(); if (!ed[t]) { ed[t] = { via }; lsSet("mjb_editions", ed); } }
function recordSelfGrade({ src, qid, grade, front, back, given }) {
  const a = lsGet("mjb_attempts", []); a.push({ d: todayISO(), src, qid, ok: grade !== "missed" }); if (a.length > 2000) a.splice(0, a.length - 2000); lsSet("mjb_attempts", a);
  if (grade === "missed") {
    const e = lsGet("mjb_errata", []); e.unshift({ d: todayISO(), src, prompt: front, given: given || "", correct: back, rule: "" }); if (e.length > 200) e.length = 200; lsSet("mjb_errata", e);
    upsertCard(`${src}:${qid}`, front, back, src, 1);
  } else if (grade === "shaky") upsertCard(`${src}:${qid}`, front, back, src, 3);
  else { const cards = lsGet("mjb_srs", []); const i = cards.findIndex(x => x.id === `${src}:${qid}`); if (i >= 0) { cards[i] = sm2(cards[i], 5); lsSet("mjb_srs", cards); } }
  recordEdition(src);
  learnPing();
}
const recordDrillResult = ({ src, qid, ok, front, back, given }) => recordSelfGrade({ src, qid, grade: ok ? "solid" : "missed", front, back, given });
// Streak in NYSE trading days; one silent grace day per calendar week.
function computeStreak(editions) {
  let streak = 0; const grace = new Set(); const d = new Date();
  if (!(isTradingDay(d) && editions[toISO(d)])) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    if (isTradingDay(d)) {
      if (editions[toISO(d)]) streak++;
      else if (!grace.has(weekKey(d))) grace.add(weekKey(d));
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
const CAT_LABELS = { acct: "Accounting", ev: "EV & Equity Value", val: "Valuation & DCF", merger: "Merger Math", lbo: "LBO", mkts: "Markets", deal: "Deal Discussion", fit: "Fit" };
// The question bank is a separate lazy chunk so the home page (the recruiter entry) stays light.
let TECH_BANK_CACHE = null;
function useTechBank() {
  const [bank, setBank] = useState(TECH_BANK_CACHE || []);
  useEffect(() => { if (TECH_BANK_CACHE) return; let on = true; import("./technicals.json").then(m => { TECH_BANK_CACHE = m.default; if (on) setBank(m.default); }).catch(() => {}); return () => { on = false; }; }, []);
  return bank;
}
let LEX_BANK_CACHE = null;
function useLexicon() {
  const [bank, setBank] = useState(LEX_BANK_CACHE || []);
  useEffect(() => { if (LEX_BANK_CACHE) return; let on = true; import("./lexicon.json").then(m => { LEX_BANK_CACHE = m.default; if (on) setBank(m.default); }).catch(() => {}); return () => { on = false; }; }, []);
  return bank;
}
let BIAS_BANK_CACHE = null;
function useBiases() {
  const [bank, setBank] = useState(BIAS_BANK_CACHE || []);
  useEffect(() => { if (BIAS_BANK_CACHE) return; let on = true; import("./biases.json").then(m => { BIAS_BANK_CACHE = m.default; if (on) setBank(m.default); }).catch(() => {}); return () => { on = false; }; }, []);
  return bank;
}
const AwaitingWire = () => <div style={{ fontSize: 10, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, padding: "8px 0" }}>AWAITING WIRE <span style={{ animation: "blink 1s step-end infinite", color: "#0d6d56" }}>▮</span></div>;
const GradeBar = ({ onGrade, done, doneLabel = "Marked — misses return via the docket" }) => done
  ? <span style={{ fontSize: 8.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>{doneLabel}</span>
  : <span style={{ display: "inline-flex", gap: 16, alignItems: "baseline" }}>
      <span style={{ fontSize: 8.5, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>Mark yourself —</span>
      {[["missed", "Missed", "#b2342b"], ["shaky", "Shaky", "#b0741e"], ["solid", "Solid", "#0d6d56"]].map(([g, l, c]) => <button key={g} onClick={() => onGrade(g)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: c, padding: 0, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{l}</button>)}
    </span>;
const Redacted = ({ revealed, onReveal, children }) => revealed
  ? <div style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.75 }}>{children}</div>
  : <button onClick={onReveal} style={{ display: "block", width: "100%", background: "#262421", border: "none", borderRadius: 3, padding: "13px 16px", cursor: "pointer", textAlign: "center" }}>
      <span style={{ fontSize: 8, color: "#faf3ea", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 3, textTransform: "uppercase" }}>Answer set in ink — click to reveal</span>
    </button>;

function QOTD() {
  const bank = useTechBank();
  const [rev, setRev] = useState(false);
  const [done, setDone] = useState(() => lsGet("mjb_attempts", []).some(x => x.src === "qotd" && x.d === todayISO()));
  const att = lsGet("mjb_attempts", []).filter(x => x.src === "qotd");
  const answered = lastTradingDays(30).filter(d => att.some(x => x.d === d)).length;
  if (!bank.length) return <AwaitingWire />;
  const q = bank[Math.floor(Date.now() / 86400000) % bank.length];
  return <div>
    <div style={{ fontSize: 8, color: "#6d549e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{CAT_LABELS[q.cat]} · Difficulty {"I".repeat(q.d)}</div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 19, color: "#262421", lineHeight: 1.45, marginBottom: 12 }}>{q.q}</p>
    <Redacted revealed={rev} onReveal={() => setRev(true)}>{q.a}</Redacted>
    {rev && <div style={{ marginTop: 12 }}>
      <GradeBar done={done} onGrade={g => { recordSelfGrade({ src: "qotd", qid: q.id, grade: g, front: q.q, back: q.a }); setDone(true); }} />
    </div>}
    <SourceLine>One question per day from the house bank · same edition for every reader · answered {answered} of the last 30 trading days · grades stay in your browser</SourceLine>
  </div>;
}

function TechnicalsDesk() {
  const bank = useTechBank();
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);
  const [rev, setRev] = useState(false);
  const [marked, setMarked] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 8;
  const list = cat === "all" ? bank : bank.filter(x => x.cat === cat);
  const visible = showAll ? list : list.slice(0, PREVIEW);
  const toggle = id => { setOpen(open === id ? null : id); setRev(false); setMarked(false); };
  if (!bank.length) return <AwaitingWire />;
  return <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {[["all", "All"], ...Object.entries(CAT_LABELS)].map(([k, l]) => <button key={k} onClick={() => { setCat(k); setOpen(null); setShowAll(false); }} style={{ ...S.chip, padding: "5px 11px", fontSize: 10, cursor: "pointer", ...(cat === k ? { color: "#0d6d56", border: "1px solid #0d6d5640", background: "rgba(13,109,86,0.06)" } : {}) }}>{l}</button>)}
    </div>
    <div style={showAll ? { maxHeight: 460, overflowY: "auto", paddingRight: 6 } : undefined}>
      {visible.map(q => <div key={q.id} style={{ borderTop: "1px solid #efe4d2" }}>
        <button onClick={() => toggle(q.id)} style={{ display: "flex", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "10px 2px", gap: 10, alignItems: "baseline", textAlign: "left" }}>
          <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, flexShrink: 0, width: 24 }}>{"I".repeat(q.d)}</span>
          <span style={{ fontSize: 13, color: open === q.id ? "#0d6d56" : "#33302c", lineHeight: 1.5, flex: 1 }}>{q.q}</span>
          <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>{CAT_LABELS[q.cat]}</span>
        </button>
        {open === q.id && <div style={{ padding: "2px 2px 14px 34px" }}>
          <Redacted revealed={rev} onReveal={() => setRev(true)}>{q.a}</Redacted>
          {rev && <div style={{ marginTop: 10 }}>
            <GradeBar done={marked} onGrade={g => { recordSelfGrade({ src: "tech", qid: q.id, grade: g, front: q.q, back: q.a }); setMarked(true); }} />
          </div>}
        </div>}
      </div>)}
    </div>
    {list.length > PREVIEW && <button onClick={() => setShowAll(!showAll)} style={{ display: "block", width: "100%", background: "none", border: "none", borderTop: "1px solid #ddcfb8", cursor: "pointer", padding: "10px 2px 4px", textAlign: "center", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", color: "#0d6d56" }}>{showAll ? "▴ Fold the bank away" : `▾ Open the full bank — ${list.length} questions`}</button>}
    <SourceLine>{bank.length} questions at press time · house bank, original questions · reveal before you grade — say the answer out loud first</SourceLine>
  </div>;
}

const LEX_CAT_LABELS = { acct: "Accounting", val: "Valuation", ma: "M&A", lbo: "LBO & Private Equity", cred: "Credit & LevFin", fi: "Bonds & Rates", eq: "Equities", der: "Derivatives", mac: "Macro & the Fed", wm: "Wealth & Portfolio", str: "Street Speak" };
function LexiconBox({ desk }) {
  const bank = useLexicon();
  const [quiz, setQuizRaw] = useState(() => lsGet("mjb_lex_quiz", desk));
  const [rev, setRev] = useState(false);
  const [done, setDone] = useState(() => lsGet("mjb_attempts", []).some(x => x.src === "lexicon" && x.d === todayISO()));
  const setQuiz = v => { setQuizRaw(v); lsSet("mjb_lex_quiz", v); setRev(false); };
  if (!bank.length) return <AwaitingWire />;
  const day = Math.floor(Date.now() / 86400000);
  const t = bank[day % bank.length];
  const body = <>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.75, marginBottom: 8 }}>{t.def}</p>
    <p style={{ fontSize: 11.5, color: "#6f675c", fontStyle: "italic", lineHeight: 1.6, borderLeft: "2px solid #ddcfb8", paddingLeft: 10, margin: 0 }}>{t.usage}</p>
  </>;
  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 8, color: "#1f5a9e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>{LEX_CAT_LABELS[t.cat] || t.cat} · Entry {(day % bank.length) + 1} of {bank.length}</span>
      <button onClick={() => setQuiz(!quiz)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: quiz ? "#0d6d56" : "#8a8072", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>Quiz me first · {quiz ? "on" : "off"}</button>
    </div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 21, color: "#262421", lineHeight: 1.3, marginBottom: 10 }}>{t.term}</p>
    {quiz ? <>
      <Redacted revealed={rev} onReveal={() => setRev(true)}>{body}</Redacted>
      {rev && <div style={{ marginTop: 12 }}>
        <GradeBar done={done} onGrade={g => { recordSelfGrade({ src: "lexicon", qid: t.id, grade: g, front: `Define: ${t.term}`, back: t.def }); setDone(true); }} />
      </div>}
    </> : body}
    <SourceLine>One term per day from the {bank.length}-entry house lexicon · original definitions, set in-house · same entry for every reader{quiz ? " · quiz marks stay in your browser" : ""}</SourceLine>
  </div>;
}

// The Bias Ledger's cross-print: read the paper book (locally) for the classic tells.
function biasCrossPrints(bank) {
  const book = lsGet("mjb_paper", null);
  if (!book || !Array.isArray(book.positions) || !book.positions.length) return [];
  const name = id => (bank.find(b => b.id === id) || {}).name || id;
  const marks = cacheGet("mjb_paper_marks", 1440) || {};
  const out = [];
  const marked = book.positions.filter(p => typeof marks[p.ticker] === "number" && marks[p.ticker] > 0);
  const losers = marked.filter(p => marks[p.ticker] < p.basis);
  if (losers.length >= 2) out.push({ id: "disposition-effect", line: `${losers.length} positions held below entry` });
  if (marked.length && marked.length === book.positions.length) {
    const cost = marked.reduce((s, p) => s + p.basis * p.shares, 0);
    const mv = marked.reduce((s, p) => s + marks[p.ticker] * p.shares, 0);
    if (cost > 0 && (mv - cost) / cost > 0.10) out.push({ id: "house-money-effect", line: `the book is up ${Math.round(((mv - cost) / cost) * 100)}% on cost` });
    const top = marked.reduce((a, p) => (marks[p.ticker] * p.shares > marks[a.ticker] * a.shares ? p : a));
    const topShare = (marks[top.ticker] * top.shares) / (mv + (book.cash || 0));
    if (mv > 0 && topShare > 0.35) out.push({ id: "overconfidence", line: `${top.ticker} alone is ${Math.round(topShare * 100)}% of the book` });
  }
  const now = Date.now();
  const week = (book.blotter || []).filter(e => { const ts = new Date(e.d).getTime(); return ts && now - ts < 7 * 86400000; });
  if (week.length >= 5) out.push({ id: "action-bias", line: `${week.length} trades printed inside a week` });
  const latest = (book.blotter || []).reduce((m, e) => Math.max(m, new Date(e.d).getTime() || 0), 0);
  if (latest && now - latest > 30 * 86400000) out.push({ id: "status-quo-bias", line: "no trade printed in over 30 days" });
  return out.map(x => ({ ...x, bias: name(x.id) }));
}
function BiasLedger({ desk }) {
  const bank = useBiases();
  if (!bank.length) return <AwaitingWire />;
  const day = Math.floor(Date.now() / 86400000);
  const b = bank[day % bank.length];
  const prints = desk ? biasCrossPrints(bank) : [];
  return <div>
    <div style={{ fontSize: 8, color: "#990f3d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Behavioral finance · Entry {(day % bank.length) + 1} of {bank.length}</div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 21, color: "#262421", lineHeight: 1.3, marginBottom: 10 }}>{b.name}</p>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.75, marginBottom: 10 }}>{b.def}</p>
    <div style={{ fontSize: 11.5, color: "#4a443c", lineHeight: 1.65, marginBottom: 6 }}><span style={{ fontSize: 8, color: "#b0741e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 8 }}>The tell</span>{b.tell}</div>
    <div style={{ fontSize: 11.5, color: "#4a443c", lineHeight: 1.65 }}><span style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 8 }}>The counter</span>{b.counter}</div>
    {prints.length > 0 && <div style={{ marginTop: 12, borderTop: "1px solid #efe4d2", paddingTop: 9 }}>
      <div style={{ fontSize: 8, color: "#990f3d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Cross-print · your paper book</div>
      {prints.map(p => <div key={p.id} style={{ fontSize: 11, color: "#4a443c", lineHeight: 1.65 }}>{p.line[0].toUpperCase() + p.line.slice(1)} — see: <i>{p.bias}</i>{p.id === b.id ? <span style={{ color: "#990f3d" }}> — printed above.</span> : null}</div>)}
    </div>}
    <SourceLine>One bias per day from the {bank.length}-entry ledger{desk ? " · cross-prints read your paper book locally — nothing leaves this browser" : ""}</SourceLine>
  </div>;
}

// Explain It to the Desk — the Feynman drill. Write the concept in plain sentences;
// with a key set, Claude plays the sharp novice and returns the one gap + one follow-up.
const EXPLAIN_PROMPTS = [
  "Explain to a smart friend why a company can report record profits and still run out of cash.",
  "Explain why a dollar next year is worth less than a dollar today — without using the word “discount.”",
  "Explain why an acquirer usually pays a premium over the market price, and who pockets it.",
  "Explain leverage with a house: why borrowing amplifies both gains and losses.",
  "Explain why bond prices fall when interest rates rise, to someone who owns a bond fund.",
  "Explain what an investment banker actually sells to a client — it isn't money.",
  "Explain why depreciation shows up on the income statement when no money left the building.",
  "Explain what a P/E ratio actually tells you, and one way it can lie.",
  "Explain what synergies are and why the market is often skeptical of them.",
  "Explain why lenders care about covenants — what job do they do?",
  "Explain what an inverted yield curve is and why people treat it as an omen.",
  "Explain why holding a losing stock “until it comes back” is a decision, not a default.",
  "Explain what deferred revenue is and why it sits on the balance sheet as a debt to customers.",
  "Explain why two companies with identical profits can deserve very different price tags.",
  "Explain accretion versus dilution to a board member who only cares about EPS.",
  "Explain what carried interest is and why the sponsor only eats after its investors do.",
  "Explain what the Fed actually does when it “raises rates” — the mechanics, not the headline.",
  "Explain risk versus volatility — are they the same thing for a 25-year-old saver?",
  "Explain why the balance sheet has to balance — what forces the two sides to be equal?",
  "Explain enterprise value versus market cap, as if pricing a house with a mortgage on it.",
  "Explain why a company might pay for an acquisition in stock rather than cash, and what that signals.",
  "Explain how private equity can make money buying a company that never grows.",
  "Explain inflation's effect on savers, borrowers, and the stock market — one sentence each.",
  "Explain why past fund performance is a weak guide to future results.",
  "Explain the difference between bookings, revenue, and cash collected, using a gym membership.",
  "Explain why most of a DCF's value usually sits in the terminal value, and why that should bother you.",
  "Explain what a fairness opinion is and who it actually protects.",
  "Explain what happens to each layer of the capital structure when a company can't pay its debts.",
  "Explain what short selling is and where its risk differs from buying a stock.",
  "Explain what “priced in” means and why good news can make a stock fall.",
  "Explain why buying a $1M machine doesn't reduce this year's profit by $1M.",
  "Explain what WACC is and why riskier businesses face a higher bar.",
  "Explain why debt is “cheaper” than equity — and why a company doesn't fund itself entirely with it.",
  "Explain why diversification is called the only free lunch in finance.",
  "Explain why the dollar strengthening can hurt US companies that sell globally.",
  "Explain what working capital is and why growing companies are always hungry for it.",
  "Explain why buybacks can raise earnings per share without making the business any better.",
  "Explain what market makers do and how the bid-ask spread pays them.",
  "Explain what the VIX measures and what a high reading actually says.",
  "Explain the rule of 72 and why compounding sneaks up on people.",
];
function ExplainDesk({ apiKey }) {
  const day = Math.floor(Date.now() / 86400000);
  const prompt = EXPLAIN_PROMPTS[day % EXPLAIN_PROMPTS.length];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [review, setReview] = useState(() => lsGet("mjb_explain", []).find(x => x.d === todayISO()) || null);
  const [done, setDone] = useState(() => lsGet("mjb_attempts", []).some(x => x.src === "explain" && x.d === todayISO()));
  const send = async () => {
    const t = text.trim();
    if (t.split(/[.!?]+/).filter(s => s.trim().length > 8).length < 2) { setErr("Give the desk at least two full sentences."); return; }
    setErr(""); setBusy(true);
    try {
      const d = await callAPI(apiKey, { model: "claude-sonnet-5", max_tokens: 400, messages: [{ role: "user", content: `You are a sharp, genuinely curious novice who just joined a trading desk — no finance background, but quick, and unafraid to ask. Someone was asked: "${prompt}"\n\nTheir explanation:\n"""\n${t}\n"""\n\nFind the ONE most important gap: the missing piece, hidden assumption, or wrong turn that would most improve the explanation (not a style note). Then ask the single follow-up question a curious novice would naturally ask next. Return ONLY JSON, no markdown: {"gap":"1-2 specific sentences","followup":"one question"}` }] });
      const raw = extractText(d);
      const m = raw && raw.match(/\{[\s\S]*\}/);
      if (!m) { setErr("The desk didn't answer — try again in a moment."); return; }
      let j; try { j = JSON.parse(m[0]); } catch { setErr("The desk mumbled — try again."); return; }
      const entry = { d: todayISO(), prompt, answer: t, gap: String(j.gap || ""), followup: String(j.followup || "") };
      const all = lsGet("mjb_explain", []).filter(x => x.d !== entry.d); all.unshift(entry); if (all.length > 60) all.length = 60; lsSet("mjb_explain", all);
      setReview(entry);
    } catch { setErr("The desk didn't answer — try again in a moment."); }
    finally { setBusy(false); }
  };
  return <div>
    <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Feynman drill · Prompt {(day % EXPLAIN_PROMPTS.length) + 1} of {EXPLAIN_PROMPTS.length}</div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 19, color: "#262421", lineHeight: 1.45, marginBottom: 12 }}>{prompt}</p>
    {review ? <div>
      <p style={{ fontSize: 11.5, color: "#6f675c", fontStyle: "italic", lineHeight: 1.65, borderLeft: "2px solid #ddcfb8", paddingLeft: 10, marginBottom: 12 }}>{review.answer}</p>
      <div style={{ fontSize: 11.5, color: "#4a443c", lineHeight: 1.65, marginBottom: 6 }}><span style={{ fontSize: 8, color: "#990f3d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 8 }}>The gap</span>{review.gap}</div>
      <div style={{ fontSize: 11.5, color: "#4a443c", lineHeight: 1.65, marginBottom: 12 }}><span style={{ fontSize: 8, color: "#1f5a9e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 8 }}>The follow-up</span>{review.followup}</div>
      <GradeBar done={done} doneLabel="Marked — the gap files to the docket" onGrade={g => { recordSelfGrade({ src: "explain", qid: String(day), grade: g, front: review.prompt, back: review.gap, given: review.answer }); setDone(true); }} />
    </div> : <div>
      <textarea value={text} onChange={e => { setText(e.target.value); setErr(""); }} placeholder="Three to five plain sentences. No term you couldn't unpack if the novice asked." rows={4} style={{ ...S.input, width: "100%", resize: "vertical", fontSize: 12.5, lineHeight: 1.6, padding: "10px 12px", boxSizing: "border-box" }} />
      {err && <p style={{ fontSize: 10.5, color: "#b2342b", margin: "6px 0 0" }}>{err}</p>}
      {apiKey
        ? <button onClick={send} disabled={busy} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", marginTop: 10, opacity: busy ? 0.6 : 1 }}>{busy ? "The desk is reading…" : "Send to the desk"}</button>
        : <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", letterSpacing: 1, marginTop: 10 }}>WRITE IT ANYWAY — THE DESK'S REVIEW NEEDS AN ANTHROPIC KEY IN SETTINGS</div>}
    </div>}
    <SourceLine>One prompt per day, same for every reader · with a key set, Claude plays the inquisitive novice: one gap, one follow-up · your writing stays in this browser</SourceLine>
  </div>;
}

// The Syllabus Ledger — mastery states derived from the attempt log with 30-day decay.
// Agate text states, never progress bars; the weakest unit sets the day's assignment.
const SYL_UNITS = [
  { k: "I", name: "Accounting & the Statements" },
  { k: "II", name: "Valuation" },
  { k: "III", name: "Merger Math & Deals" },
  { k: "IV", name: "LBO & Credit" },
  { k: "V", name: "Markets, Macro & Fixed Income" },
  { k: "VI", name: "Communication & Fit" },
];
const SYL_CAT_UNIT = { acct: "I", ev: "II", val: "II", merger: "III", ma: "III", lbo: "IV", cred: "IV", mkts: "V", fi: "V", eq: "V", der: "V", mac: "V", wm: "V", str: "VI", deal: "VI", fit: "VI" };
const SYL_SRC_UNIT = { ripple: "I", redline: "II", debt: "IV", puzzle: "IV", waterfall: "IV", coupon: "V", signals: "V", explain: "VI" };
const sylUnitOf = a => SYL_SRC_UNIT[a.src] || (String(a.qid).match(/^(?:lex-)?([a-z]+)-/) ? SYL_CAT_UNIT[String(a.qid).match(/^(?:lex-)?([a-z]+)-/)[1]] || null : null);
const SYL_STATES = {
  cold: { label: "cold", note: "no ink in 30 days", c: "#8a8072" },
  shaky: { label: "shaky", note: "", c: "#b2342b" },
  thin: { label: "thin file", note: "", c: "#b0741e" },
  working: { label: "working", note: "", c: "#1f5a9e" },
  set: { label: "set", note: "", c: "#0d6d56" },
};
function SyllabusLedger() {
  useLearnTick();
  const bank = useTechBank();
  const now = Date.now();
  const atts = lsGet("mjb_attempts", []);
  const per = {}; SYL_UNITS.forEach(u => { per[u.k] = { wOk: 0, w: 0, n: 0 }; });
  atts.forEach(a => {
    const u = sylUnitOf(a); if (!u || !per[u]) return;
    const age = (now - new Date(a.d).getTime()) / 86400000;
    if (!(age >= 0 && age <= 30)) return;
    const w = (30 - age) / 30 + 0.1;
    per[u].w += w; per[u].wOk += a.ok ? w : 0; per[u].n++;
  });
  const states = SYL_UNITS.map(u => {
    const p = per[u.k], rate = p.w ? p.wOk / p.w : 0;
    const state = p.n === 0 ? "cold" : p.n < 4 ? "thin" : rate >= 0.8 ? "set" : rate >= 0.55 ? "working" : "shaky";
    return { ...u, ...p, rate, state };
  });
  const order = { cold: 0, shaky: 1, thin: 2, working: 3, set: 4 };
  const weakest = [...states].sort((a, b) => order[a.state] - order[b.state] || a.rate - b.rate)[0];
  const cats = Object.keys(SYL_CAT_UNIT).filter(c => SYL_CAT_UNIT[c] === weakest.k);
  const pool = bank.filter(q => cats.includes(q.cat));
  const day = Math.floor(Date.now() / 86400000);
  const q = pool.length ? pool[(day * 7 + 1) % pool.length] : null;
  const done = q ? atts.some(x => x.src === "syllabus" && x.qid === q.id && x.d === todayISO()) : false;
  return <div>
    {states.map((u, i) => <div key={u.k} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 0", borderTop: i ? "1px solid #efe4d2" : "none" }}>
      <span style={{ fontSize: 9, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", width: 20, flexShrink: 0 }}>{u.k}.</span>
      <span style={{ fontSize: 11.5, color: "#33302c", flex: 1 }}>{u.name}</span>
      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", color: SYL_STATES[u.state].c, flexShrink: 0 }}>
        {SYL_STATES[u.state].label}{u.n > 0 ? ` · ${u.n} mark${u.n === 1 ? "" : "s"} · ${Math.round(u.rate * 100)}% clean` : ` — ${SYL_STATES.cold.note}`}
      </span>
    </div>)}
    {q && <div style={{ marginTop: 12, borderTop: "1px solid #ddcfb8", paddingTop: 11 }}>
      <div style={{ fontSize: 8, color: "#6d549e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>The assignment — Unit {weakest.k}, {weakest.name}</div>
      <QCard q={q} src="syllabus" done={done} />
    </div>}
    <SourceLine>Six units, states decay over 30 days · derived from every mark you file on this site · the weakest unit sets the day's assignment · private to this browser</SourceLine>
  </div>;
}

// Seeded three-statement perturbation drills. Tax rate 25% throughout; amounts chosen so answers are integers.
const RIPPLES = [
  { k: "dep", third: "Net PP&E", make: X => ({ prompt: `Depreciation expense rises by $${X} this period. Assume a 25% tax rate, taxes paid in cash.`, ni: -0.75 * X, cash: 0.25 * X, tv: -X,
    is: [`D&A +$${X} → pre-tax income −$${X}`, `Taxes −$${0.25 * X} → net income −$${0.75 * X}`],
    cf: [`Start at net income −$${0.75 * X}`, `Add back non-cash D&A +$${X} → cash from ops +$${0.25 * X}`, `Ending cash +$${0.25 * X}`],
    bs: [`Assets: cash +$${0.25 * X}, net PP&E −$${X} → total −$${0.75 * X}`, `Equity: retained earnings −$${0.75 * X} — balances`] }) },
  { k: "writedown", third: "Inventory", make: X => ({ prompt: `The company writes down $${X} of inventory (a non-cash charge). Assume a 25% tax rate, taxes paid in cash.`, ni: -0.75 * X, cash: 0.25 * X, tv: -X,
    is: [`Write-down +$${X} of expense → pre-tax income −$${X}`, `Taxes −$${0.25 * X} → net income −$${0.75 * X}`],
    cf: [`Start at net income −$${0.75 * X}`, `Add back the non-cash write-down +$${X} → cash from ops +$${0.25 * X}`],
    bs: [`Assets: cash +$${0.25 * X}, inventory −$${X} → total −$${0.75 * X}`, `Equity: retained earnings −$${0.75 * X} — balances`] }) },
  { k: "sbc", third: "Total shareholders' equity", make: X => ({ prompt: `The company records $${X} of stock-based compensation. Assume a 25% tax rate, taxes paid in cash.`, ni: -0.75 * X, cash: 0.25 * X, tv: 0.25 * X,
    is: [`SBC expense +$${X} → pre-tax income −$${X}`, `Taxes −$${0.25 * X} → net income −$${0.75 * X}`],
    cf: [`Start at net income −$${0.75 * X}`, `Add back non-cash SBC +$${X} → cash from ops +$${0.25 * X}`],
    bs: [`Assets: cash +$${0.25 * X}`, `Equity: paid-in capital +$${X}, retained earnings −$${0.75 * X} → equity +$${0.25 * X} — balances`] }) },
  { k: "defrev", third: "Total liabilities", make: X => ({ prompt: `The company collects $${X} in cash for a service it has not yet delivered. No revenue is recognized this period.`, ni: 0, cash: X, tv: X,
    is: ["No revenue recognized → net income unchanged"],
    cf: [`Deferred revenue +$${X} is a working-capital source → cash from ops +$${X}`],
    bs: [`Assets: cash +$${X}`, `Liabilities: deferred revenue +$${X} — balances`] }) },
  { k: "ar", third: "Accounts receivable", make: X => ({ prompt: `The company books a $${X} sale entirely on credit — ignore COGS. Assume a 25% tax rate, taxes paid in cash.`, ni: 0.75 * X, cash: -0.25 * X, tv: X,
    is: [`Revenue +$${X} → pre-tax income +$${X}`, `Taxes +$${0.25 * X} paid in cash → net income +$${0.75 * X}`],
    cf: [`Start at net income +$${0.75 * X}`, `Accounts receivable +$${X} is a working-capital use −$${X} → cash from ops −$${0.25 * X}`],
    bs: [`Assets: cash −$${0.25 * X}, AR +$${X} → total +$${0.75 * X}`, `Equity: retained earnings +$${0.75 * X} — balances`] }) },
  { k: "capex", third: "Net PP&E", make: X => ({ prompt: `The company buys $${X} of equipment in cash at year-end — no depreciation has been taken yet.`, ni: 0, cash: -X, tv: X,
    is: ["Capex never touches the income statement directly → net income unchanged"],
    cf: [`Investing: capex −$${X} → ending cash −$${X}`],
    bs: [`Assets: cash −$${X}, net PP&E +$${X} → total unchanged — balances`] }) },
  { k: "accrual", third: "Total liabilities", make: X => ({ prompt: `The company accrues $${X} of operating expenses it has not yet paid. Assume a 25% tax rate, taxes paid in cash.`, ni: -0.75 * X, cash: 0.25 * X, tv: X,
    is: [`Accrued expense +$${X} → pre-tax income −$${X}`, `Taxes −$${0.25 * X} → net income −$${0.75 * X}`],
    cf: [`Start at net income −$${0.75 * X}`, `Accrued liabilities +$${X} is a working-capital source → cash from ops +$${0.25 * X}`],
    bs: [`Assets: cash +$${0.25 * X}`, `Liabilities +$${X}; equity: retained earnings −$${0.75 * X} — balances`] }) },
  { k: "prepaid", third: "Prepaid expenses", make: X => ({ prompt: `The company pays $${X} in cash today for next year's insurance. No expense is recognized this period.`, ni: 0, cash: -X, tv: X,
    is: ["Nothing expensed yet → net income unchanged"],
    cf: [`Prepaid expenses +$${X} is a working-capital use → cash from ops −$${X}`],
    bs: [`Assets: cash −$${X}, prepaid expenses +$${X} → total unchanged — balances`] }) },
  { k: "debt", third: "Long-term debt", make: X => ({ prompt: `The company issues $${X} of long-term debt at year-end — no interest has accrued yet.`, ni: 0, cash: X, tv: X,
    is: ["Raising debt is a financing event → net income unchanged"],
    cf: [`Financing: debt issuance +$${X} → ending cash +$${X}`],
    bs: [`Assets: cash +$${X}`, `Liabilities: long-term debt +$${X} — balances`] }) },
  { k: "buyback", third: "Total shareholders' equity", make: X => ({ prompt: `The company repurchases $${X} of its own shares for cash.`, ni: 0, cash: -X, tv: -X,
    is: ["Buybacks never touch the income statement → net income unchanged"],
    cf: [`Financing: share repurchase −$${X} → ending cash −$${X}`],
    bs: [`Assets: cash −$${X}`, `Equity: treasury stock −$${X} — balances`] }) },
];
function ThreeStatementRipple() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [ans, setAns] = useState({ ni: "", cash: "", tv: "" });
  const [checked, setChecked] = useState(false);
  const r = mulberry32(seed * 2 + 1);
  const T = RIPPLES[Math.floor(r() * RIPPLES.length)];
  const X = [8, 12, 16, 20, 24, 40][Math.floor(r() * 6)];
  const p = T.make(X);
  const num = s => parseFloat(String(s).replace(/[$,\s]/g, "").replace(/\((\d+\.?\d*)\)/, "-$1").replace(/−/g, "-"));
  const fmt = v => v === 0 ? "$0" : v < 0 ? `−$${Math.abs(v)}` : `+$${v}`;
  const grade = { ni: Math.abs(num(ans.ni) - p.ni) <= 0.51, cash: Math.abs(num(ans.cash) - p.cash) <= 0.51, tv: Math.abs(num(ans.tv) - p.tv) <= 0.51 };
  const fields = [["ni", "Δ Net income", fmt(p.ni)], ["cash", "Δ Ending cash", fmt(p.cash)], ["tv", `Δ ${T.third}`, fmt(p.tv)]];
  const fresh = () => { setSeed(s => s + 1); setAns({ ni: "", cash: "", tv: "" }); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordDrillResult({ src: "ripple", qid: `${T.k}-${X}-${seed}`, ok: Object.values(grade).every(Boolean), front: p.prompt, back: `Net income ${fmt(p.ni)} · cash ${fmt(p.cash)} · ${T.third} ${fmt(p.tv)}`, given: `${ans.ni} / ${ans.cash} / ${ans.tv}` });
  };
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 6 }}>{p.prompt}</p>
    <p style={{ fontSize: 9.5, color: "#a2977f", marginBottom: 14 }}>State the change on each line. Decreases are negative — type −12 or (12).</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
      {fields.map(([k, label, sol]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 150, flexShrink: 0 }}>{label}</span>
        <input value={ans[k]} onChange={e => { setAns(prev => ({ ...prev, [k]: e.target.value })); setChecked(false); }} style={{ ...S.input, width: 92, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "6px 10px", textAlign: "right" }} />
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade[k] ? "#0d6d56" : "#b2342b" }}>{grade[k] ? "✓" : `✗ ${sol}`}</span>}
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: checked ? 14 : 0 }}>
      <button onClick={check} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px" }}>Check</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New problem</button>
    </div>
    {checked && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>The ripple, worked</div>
      {[["Income statement", p.is], ["Cash flow statement", p.cf], ["Balance sheet", p.bs]].map(([h, lines]) => <div key={h} style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{h}</div>
        {lines.map((s, i) => <div key={i} style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.9 }}>{s}</div>)}
      </div>)}
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>The most-asked technical question in IB interviews, drilled as arithmetic. Ten perturbation types, fresh numbers daily.</p>
  </div>;
}

// The Debt Ledger — seeded cash-sweep waterfall. Flat EBITDA, interest on the beginning
// balance, mandatory amortization off the original loan, then a sweep of what remains.
function DebtLedger() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [ans, setAns] = useState({ d1: "", d3: "", lev: "" });
  const [checked, setChecked] = useState(false);
  let P = null;
  for (let k = 0; k < 12 && !P; k++) {
    const r = mulberry32(seed * 13 + 7 + k * 101);
    const E = [80, 100, 120, 150, 200][Math.floor(r() * 5)];
    const mult = [2.5, 3, 3.5, 4][Math.floor(r() * 4)];
    const conv = [50, 60, 70][Math.floor(r() * 3)];
    const rate = [5, 10][Math.floor(r() * 2)];
    const amortPct = [5, 10][Math.floor(r() * 2)];
    const sweepPct = [50, 100][Math.floor(r() * 2)];
    const D0 = E * mult, FCF = E * conv / 100, amort = D0 * amortPct / 100;
    let d = D0; const years = []; let ok = true;
    for (let y = 1; y <= 3; y++) {
      const interest = d * rate / 100;
      const avail = FCF - interest;
      if (avail < amort) { ok = false; break; }
      const sweep = Math.min((avail - amort) * sweepPct / 100, d - amort);
      const end = d - amort - sweep;
      years.push({ y, begin: d, interest, avail, amort, sweep, end });
      d = end;
    }
    if (ok && d > 0) P = { E, mult, conv, rate, amortPct, sweepPct, D0, FCF, amort, years };
  }
  if (!P) return null;
  const fmt = v => Number.isInteger(+v.toFixed(4)) ? String(Math.round(v)) : v.toFixed(1);
  const lev3 = P.years[2].end / P.E;
  const num = s => parseFloat(String(s).replace(/[$,x\s]/gi, ""));
  const grade = { d1: Math.abs(num(ans.d1) - P.years[0].end) <= 1, d3: Math.abs(num(ans.d3) - P.years[2].end) <= 1, lev: Math.abs(num(ans.lev) - lev3) <= 0.06 };
  const fields = [["d1", "Ending debt, Year 1 ($M)", fmt(P.years[0].end)], ["d3", "Ending debt, Year 3 ($M)", fmt(P.years[2].end)], ["lev", "Leverage at exit (x)", `${lev3.toFixed(2)}x`]];
  const fresh = () => { setSeed(s => s + 1); setAns({ d1: "", d3: "", lev: "" }); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordDrillResult({ src: "debt", qid: String(seed), ok: Object.values(grade).every(Boolean), front: `Cash sweep: $${P.D0}M loan at ${P.rate}%, EBITDA $${P.E}M, ${P.conv}% conversion, ${P.amortPct}% mandatory amort, ${P.sweepPct}% sweep — ending debt Y1/Y3 and exit leverage?`, back: `Y1 $${fmt(P.years[0].end)}M · Y3 $${fmt(P.years[2].end)}M · ${lev3.toFixed(2)}x`, given: `${ans.d1} / ${ans.d3} / ${ans.lev}` });
  };
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 6 }}>
      A sponsor puts a <b>${P.D0}M term loan</b> ({P.mult.toFixed(1)}x) on a business with flat <b>${P.E}M EBITDA</b>, of which <b>{P.conv}%</b> converts to free cash flow before debt service. The loan pays <b>{P.rate}% interest</b> on the beginning balance, amortizes <b>{P.amortPct}% of the original principal</b> per year, and <b>{P.sweepPct}% of remaining cash</b> sweeps to prepayment. Work three years on paper:
    </p>
    <p style={{ fontSize: 9.5, color: "#a2977f", marginBottom: 14 }}>Order of operations each year: interest first, then mandatory amortization, then the sweep.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
      {fields.map(([k, label, sol]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 170, flexShrink: 0 }}>{label}</span>
        <input value={ans[k]} onChange={e => { setAns(p => ({ ...p, [k]: e.target.value })); setChecked(false); }} style={{ ...S.input, width: 92, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "6px 10px", textAlign: "right" }} />
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade[k] ? "#0d6d56" : "#b2342b" }}>{grade[k] ? "✓" : `✗ ${sol}`}</span>}
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: checked ? 14 : 0 }}>
      <button onClick={check} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px" }}>Check</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New problem</button>
    </div>
    {checked && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>The waterfall, worked</div>
      {P.years.map(y => <div key={y.y} style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 2 }}>
        Y{y.y}: FCF {fmt(P.FCF)} − interest {fmt(y.interest)} = {fmt(y.avail)} → amort {fmt(y.amort)}, sweep {fmt(y.sweep)} → debt {fmt(y.begin)} → {fmt(y.end)}
      </div>)}
      <div style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 2 }}>Exit leverage = {fmt(P.years[2].end)} ÷ {P.E} = {lev3.toFixed(2)}x</div>
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>Debt schedules are where LBO models actually get lost. Interest on beginning balance, flat EBITDA, no fees or taxes. Fresh numbers daily.</p>
  </div>;
}

// The Coupon Desk — bond arithmetic a desk expects done in your head.
function CouponDesk() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [ans, setAns] = useState({ cy: "", chg: "", np: "" });
  const [checked, setChecked] = useState(false);
  const r = mulberry32(seed * 17 + 3);
  const c = [3, 4, 5, 6][Math.floor(r() * 4)];
  const price = [88, 90, 92, 94, 96, 102, 104][Math.floor(r() * 7)];
  const [M, D] = [[5, 4.4], [7, 6.1], [10, 8.2]][Math.floor(r() * 3)];
  const bp = [25, 50, 75, 100][Math.floor(r() * 4)];
  const up = r() < 0.5; // rates rise?
  const cy = c / price * 100;
  const chg = (up ? -1 : 1) * D * bp / 100;
  const newP = price * (1 + chg / 100);
  const discount = price < 100;
  const num = s => parseFloat(String(s).replace(/[$,%\s]/g, "").replace(/−/g, "-"));
  const grade = { cy: Math.abs(num(ans.cy) - cy) <= 0.05, chg: Math.abs(num(ans.chg) - chg) <= 0.05, np: Math.abs(num(ans.np) - newP) <= 0.2 };
  const fields = [["cy", "Current yield (%)", `${cy.toFixed(2)}%`], ["chg", "Approx. price change (%)", `${chg >= 0 ? "+" : "−"}${Math.abs(chg).toFixed(2)}%`], ["np", "New approx. price", newP.toFixed(2)]];
  const fresh = () => { setSeed(s => s + 1); setAns({ cy: "", chg: "", np: "" }); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordDrillResult({ src: "coupon", qid: String(seed), ok: Object.values(grade).every(Boolean), front: `${M}-year ${c}% coupon bond at ${price}.00, modified duration ${D}, rates ${up ? "rise" : "fall"} ${bp}bp — current yield, price change, new price?`, back: `CY ${cy.toFixed(2)}% · Δ ${chg >= 0 ? "+" : ""}${chg.toFixed(2)}% · ${newP.toFixed(2)}`, given: `${ans.cy} / ${ans.chg} / ${ans.np}` });
  };
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 6 }}>
      A <b>{M}-year bond</b> pays a <b>{c}% annual coupon</b> and trades at <b>{price}.00</b> (per 100 par). Its modified duration is <b>≈ {D}</b>. Rates {up ? <b>rise {bp}bp</b> : <b>fall {bp}bp</b>} across the curve. Work it on paper:
    </p>
    <p style={{ fontSize: 9.5, color: "#a2977f", marginBottom: 14 }}>Use the duration approximation: %Δprice ≈ −duration × Δyield. Decreases are negative.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
      {fields.map(([k, label, sol]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 170, flexShrink: 0 }}>{label}</span>
        <input value={ans[k]} onChange={e => { setAns(p => ({ ...p, [k]: e.target.value })); setChecked(false); }} style={{ ...S.input, width: 92, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "6px 10px", textAlign: "right" }} />
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade[k] ? "#0d6d56" : "#b2342b" }}>{grade[k] ? "✓" : `✗ ${sol}`}</span>}
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: checked ? 14 : 0 }}>
      <button onClick={check} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px" }}>Check</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New problem</button>
    </div>
    {checked && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Worked solution</div>
      {[`Current yield = ${c} ÷ ${price} = ${cy.toFixed(2)}%`,
        `%Δprice ≈ −${D} × ${up ? "+" : "−"}${(bp / 100).toFixed(2)}% = ${chg >= 0 ? "+" : "−"}${Math.abs(chg).toFixed(2)}%`,
        `New price ≈ ${price} × (1 ${chg >= 0 ? "+" : "−"} ${Math.abs(chg / 100).toFixed(4)}) = ${newP.toFixed(2)}`,
        discount ? `Trading at a discount: coupon ${c}% < current yield ${cy.toFixed(2)}% < YTM — the pull to par adds return beyond the coupon.` : `Trading at a premium: YTM < current yield ${cy.toFixed(2)}% < coupon ${c}% — part of each coupon is really return OF capital.`
      ].map((s, i) => <div key={i} style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 2 }}>{i + 1}. {s}</div>)}
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>The arithmetic that separates watching the 10-year from understanding it. Annual coupons, linear duration approximation. Fresh numbers daily.</p>
  </div>;
}

// The Waterfall Room — absolute-priority recovery drill. One emergence EV, three classes
// of debt; value falls through the structure until it runs out. The class cut short is the fulcrum.
function WaterfallRoom() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [ans, setAns] = useState({ sr: "", sub: "" });
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  let P = null;
  for (let k = 0; k < 16 && !P; k++) {
    const r = mulberry32(seed * 31 + 19 + k * 101);
    const E = [60, 80, 100, 120][Math.floor(r() * 4)];
    const lien = E * [2, 2.5, 3][Math.floor(r() * 3)];
    const sr = E * [1.5, 2][Math.floor(r() * 2)];
    const sub = E * [1, 1.5][Math.floor(r() * 2)];
    const EV = E * [3, 3.5, 4, 4.5, 5][Math.floor(r() * 5)];
    // The fulcrum must be strictly PARTIALLY recovered: keep EV a margin away from every class boundary.
    if (EV <= lien + E * 0.25 || EV >= lien + sr + sub - E * 0.25 || Math.abs(EV - (lien + sr)) <= E * 0.25) continue;
    const toSr = Math.min(sr, EV - lien);
    const toSub = Math.max(0, Math.min(sub, EV - lien - sr));
    P = { E, lien, sr, sub, EV, toSr, toSub, recSr: toSr / sr * 100, recSub: toSub / sub * 100, fulcrum: toSr < sr ? "sr" : "sub" };
  }
  if (!P) return null;
  const num = s => parseFloat(String(s).replace(/[$,%¢\s]/g, ""));
  const grade = { sr: Math.abs(num(ans.sr) - P.recSr) <= 1, sub: Math.abs(num(ans.sub) - P.recSub) <= 1, f: pick === P.fulcrum };
  const fields = [["sr", "Senior notes recovery (¢ per $1)", P.recSr.toFixed(1)], ["sub", "Subordinated recovery (¢ per $1)", P.recSub.toFixed(1)]];
  const TRANCHES = [["lien", "1st-lien loan"], ["sr", "Senior notes"], ["sub", "Sub notes"]];
  const fresh = () => { setSeed(s => s + 1); setAns({ sr: "", sub: "" }); setPick(null); setChecked(false); };
  const check = () => {
    setChecked(true);
    recordDrillResult({ src: "waterfall", qid: String(seed), ok: Object.values(grade).every(Boolean), front: `Recovery waterfall: $${P.EV}M emergence EV against 1st lien $${P.lien}M, senior notes $${P.sr}M, subs $${P.sub}M — recoveries and the fulcrum?`, back: `Senior ${P.recSr.toFixed(1)}¢ · Sub ${P.recSub.toFixed(1)}¢ · fulcrum: ${P.fulcrum === "sr" ? "senior notes" : "sub notes"}`, given: `${ans.sr} / ${ans.sub} / ${pick || "—"}` });
  };
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 6 }}>
      A business with <b>${P.E}M EBITDA</b> files and emerges at <b>${P.EV}M</b> of enterprise value. The structure, top to bottom: a <b>${P.lien}M first-lien loan</b>, <b>${P.sr}M of senior notes</b>, and <b>${P.sub}M of subordinated notes</b>. Distribute the value by absolute priority:
    </p>
    <p style={{ fontSize: 9.5, color: "#a2977f", marginBottom: 14 }}>Each class is paid in full before a dollar reaches the next. The first class NOT paid in full is the fulcrum — it usually takes the post-reorg equity.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      {fields.map(([k, label, sol]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 190, flexShrink: 0 }}>{label}</span>
        <input value={ans[k]} onChange={e => { setAns(p => ({ ...p, [k]: e.target.value })); setChecked(false); }} style={{ ...S.input, width: 92, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "6px 10px", textAlign: "right" }} />
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade[k] ? "#0d6d56" : "#b2342b" }}>{grade[k] ? "✓" : `✗ ${sol}`}</span>}
      </div>)}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 190, flexShrink: 0 }}>The fulcrum security</span>
        {TRANCHES.map(([k, l]) => <button key={k} onClick={() => { setPick(k); setChecked(false); }} style={{ ...S.chip, padding: "5px 11px", fontSize: 10, cursor: "pointer", ...(pick === k ? { color: "#0d6d56", border: "1px solid #0d6d5640", background: "rgba(13,109,86,0.06)" } : {}) }}>{l}</button>)}
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade.f ? "#0d6d56" : "#b2342b" }}>{grade.f ? "✓" : `✗ ${P.fulcrum === "sr" ? "senior notes" : "sub notes"}`}</span>}
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: checked ? 14 : 0 }}>
      <button onClick={check} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px" }}>Check</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New problem</button>
    </div>
    {checked && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>The waterfall, worked</div>
      {[`$${P.EV}M falls through the structure:`,
        `1st lien: paid in full — 100¢ (${P.EV} − ${P.lien} = ${P.EV - P.lien} left)`,
        P.fulcrum === "sr" ? `Senior notes: ${P.toSr} against a ${P.sr} claim — ${P.recSr.toFixed(1)}¢. Value exhausts HERE → the fulcrum.` : `Senior notes: paid in full — 100¢ (${P.EV - P.lien} − ${P.sr} = ${P.EV - P.lien - P.sr} left)`,
        P.fulcrum === "sr" ? `Subordinated notes: nothing left — 0¢. Equity: wiped.` : `Subordinated notes: ${P.toSub} against a ${P.sub} claim — ${P.recSub.toFixed(1)}¢ → the fulcrum. Equity: wiped.`,
        `The fulcrum class ends up owning the company: its shortfall converts to post-reorg equity, which is why distressed buyers hunt for it.`
      ].map((s, i) => <div key={i} style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 2 }}>{s}</div>)}
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>The transaction-advisory interview staple: absolute priority, cents on the dollar, and who holds the keys after Chapter 11. Fresh structure daily.</p>
  </div>;
}

// The Two-Minute Tape — Zetamac's mechanic with the desk's arithmetic: 120 seconds,
// auto-advance the instant the answer is right. The day's first run is the same tape for everyone.
const TAPE_GENS = [
  r => { const b = [40, 60, 80, 120, 160, 200, 240][Math.floor(r() * 7)], p = [5, 10, 15, 20, 25, 50][Math.floor(r() * 6)], up = r() < 0.5; return { q: `Stock at ${b} ${up ? "rises" : "falls"} ${p}% — new price?`, a: Math.round(b * (1 + (up ? p : -p) / 100)) }; },
  r => { const n = [40, 80, 120, 160, 200, 240, 320, 400][Math.floor(r() * 8)], p = [15, 20, 25, 30, 35, 40, 45, 60, 75][Math.floor(r() * 9)]; return { q: `${p}% of ${n}?`, a: n * p / 100 }; },
  r => { const E = [15, 20, 25, 30, 40, 50, 60, 75, 80][Math.floor(r() * 9)], m = [4, 5, 6, 7, 8, 9, 10, 12][Math.floor(r() * 8)]; return { q: `EBITDA $${E}M at ${m}.0x — enterprise value ($M)?`, a: E * m }; },
  r => { const E = [20, 25, 30, 40, 50, 60, 80][Math.floor(r() * 7)], m = [4, 5, 6, 7, 8, 9, 11, 12][Math.floor(r() * 8)]; return { q: `EV $${E * m}M on $${E}M EBITDA — the multiple (x)?`, a: m }; },
  r => { const p = [2, 3, 4, 6, 8, 9, 12, 18][Math.floor(r() * 8)]; return { q: `Money doubles at ${p}% — years (rule of 72)?`, a: 72 / p }; },
  r => { const [ni, sh] = [[120, 40], [150, 50], [200, 40], [90, 30], [240, 60], [210, 70], [160, 40], [75, 25]][Math.floor(r() * 8)]; return { q: `Net income $${ni}M, ${sh}M shares — EPS ($)?`, a: ni / sh }; },
  r => { const pe = [8, 10, 20, 25, 40, 50][Math.floor(r() * 6)]; return { q: `P/E of ${pe}x — earnings yield (%)?`, a: 100 / pe }; },
  r => { const n = [200, 400, 600, 800][Math.floor(r() * 4)], bp = [25, 50, 75, 100, 150][Math.floor(r() * 5)]; return { q: `${bp}bp on a $${n}M facility — annual $M?`, a: n * bp / 10000 }; },
];
function TwoMinuteTape() {
  const DUR = 120;
  const [phase, setPhase] = useState("idle");
  const [left, setLeft] = useState(DUR);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState(0);
  const [input, setInput] = useState("");
  const rng = useRef(null);
  const prob = useRef(null);
  const inputRef = useRef(null);
  const scores = lsGet("mjb_tmt", []);
  const best = scores.reduce((m, s) => Math.max(m, s.score), 0);
  const todayRuns = scores.filter(s => s.d === todayISO());
  const next = () => { prob.current = TAPE_GENS[Math.floor(rng.current() * TAPE_GENS.length)](rng.current); setInput(""); setSeen(x => x + 1); };
  const start = () => { const day = Math.floor(Date.now() / 86400000); rng.current = mulberry32(day * 29 + 13 + todayRuns.length * 9973); setScore(0); setSeen(0); setLeft(DUR); setPhase("run"); next(); };
  useEffect(() => { if (phase !== "run") return; const t = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(t); }, [phase]);
  useEffect(() => {
    if (phase !== "run" || left > 0) return;
    setPhase("done");
    const all = lsGet("mjb_tmt", []); all.push({ d: todayISO(), score }); if (all.length > 200) all.splice(0, all.length - 200); lsSet("mjb_tmt", all);
    recordEdition("two-minute-tape"); learnPing();
  }, [left, phase, score]);
  useEffect(() => { if (phase === "run") inputRef.current && inputRef.current.focus(); }, [phase, seen]);
  const onType = v => { setInput(v); const a = prob.current.a; const t = v.trim(); if (t !== "" && /\d$/.test(t) && parseFloat(t) === a) { setScore(s => s + 1); next(); } };
  if (phase === "idle") return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 12 }}>
      Two minutes on the clock, finance arithmetic only: percentage moves, EV = EBITDA × multiple, earnings yields, the rule of 72, basis points on a facility. The answer submits itself the instant it's right — no Enter key, no partial credit, just the next problem.
    </p>
    <button onClick={start} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "8px 22px" }}>Start the clock</button>
    <SourceLine>{best > 0 ? `Best on record: ${best} · ` : ""}{todayRuns.length ? `${todayRuns.length} run${todayRuns.length === 1 ? "" : "s"} today · ` : ""}first run of the day is the same tape for every reader · scores stay in your browser</SourceLine>
  </div>;
  if (phase === "done") return <div>
    <div style={{ fontSize: 8, color: "#990f3d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Time — pencils down</div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: "#262421", marginBottom: 6 }}>{score} solved</p>
    <p style={{ fontSize: 11, color: "#6f675c", marginBottom: 14 }}>{seen - 1 > score ? `${seen - 1 - score} passed or unfinished · ` : ""}{score > best ? "a new house record." : best > 0 ? `best on record: ${Math.max(best, score)}.` : ""}</p>
    <button onClick={start} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "8px 22px" }}>Run it again</button>
    <SourceLine>Repeat runs today draw a fresh problem stream · tomorrow's opening tape is new for everyone</SourceLine>
  </div>;
  return <div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 8, color: "#1f5a9e", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>Solved {score}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: left <= 10 ? "#b2342b" : "#33302c" }}>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
    </div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: "#262421", lineHeight: 1.4, marginBottom: 12, minHeight: 56 }}>{prob.current.q}</p>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input ref={inputRef} value={input} onChange={e => onType(e.target.value)} inputMode="decimal" placeholder="answer" style={{ ...S.input, width: 120, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, padding: "8px 12px", textAlign: "right" }} />
      <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8072", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>Pass ↷</button>
    </div>
    <SourceLine>Auto-submits on the correct answer · decimals as decimals ("2.5") · passing costs nothing but the clock</SourceLine>
  </div>;
}

// Redline the Exhibit — the inverted drill: a finished exhibit with ONE planted error,
// internally consistent so it must be caught on principle, not arithmetic mismatch.
// Reviewing models for errors is the actual analyst job; no prep product drills it.
function buildRedline(seed) {
  const r = mulberry32(seed * 23 + 11);
  const pick = a => a[Math.floor(r() * a.length)];
  if (r() < 0.5) {
    // Unlevered FCF build
    const EBIT = pick([100, 200, 400]), DA = pick([20, 40, 50]), capex = pick([30, 60, 80]), nwc = pick([10, 20]), intExp = pick([20, 30]);
    const t = 0.25, NOPAT = EBIT * (1 - t);
    const err = pick(["interest", "dasign", "nwcsign", "taxbase"]);
    const rows = [["EBIT", EBIT]];
    let flawIdx, correct, why;
    if (err === "interest") {
      const pre = EBIT - intExp, tax = pre * t;
      rows.push([`Less: interest expense`, -intExp], ["Pre-tax income", pre], [`Less: taxes (25%)`, -tax], ["NOPAT", pre - tax], ["Plus: D&A", DA], ["Less: capex", -capex], ["Less: increase in NWC", -nwc], ["Unlevered FCF", pre - tax + DA - capex - nwc]);
      flawIdx = 1; correct = "remove this line entirely";
      why = "Unlevered free cash flow is measured before any financing: interest belongs to the debt holders' claim, not to the operations being valued. Deducting it here double-counts financing when the cash flows are later discounted at WACC. Tax EBIT directly and never let interest into the build.";
    } else if (err === "dasign") {
      rows.push([`Less: taxes (25%)`, -(EBIT * t)], ["NOPAT", NOPAT], ["Less: D&A", -DA], ["Less: capex", -capex], ["Less: increase in NWC", -nwc], ["Unlevered FCF", NOPAT - DA - capex - nwc]);
      flawIdx = 3; correct = `Plus: D&A  +${DA}`;
      why = "D&A was already deducted on the way to EBIT, and no cash left the building when it was — so it must be ADDED BACK after taxing, not subtracted again. Subtracting it here removes the same non-cash charge twice.";
    } else if (err === "nwcsign") {
      rows.push([`Less: taxes (25%)`, -(EBIT * t)], ["NOPAT", NOPAT], ["Plus: D&A", DA], ["Less: capex", -capex], ["Plus: increase in NWC", nwc], ["Unlevered FCF", NOPAT + DA - capex + nwc]);
      flawIdx = 5; correct = `Less: increase in NWC  −${nwc}`;
      why = "Working capital GROWING absorbs cash — receivables and inventory build faster than payables. An increase in net working capital is a use of cash and must be subtracted. Adding it treats tied-up cash as if it were freed.";
    } else {
      const wrongTax = (EBIT + DA) * t;
      rows.push([`Less: taxes (25%)`, -wrongTax], ["NOPAT", EBIT - wrongTax], ["Plus: D&A", DA], ["Less: capex", -capex], ["Less: increase in NWC", -nwc], ["Unlevered FCF", EBIT - wrongTax + DA - capex - nwc]);
      flawIdx = 1; correct = `Less: taxes (25%)  −${EBIT * t}`;
      why = `Taxes here were computed on EBITDA (${EBIT} + ${DA}), but the depreciation shield is real: the tax authority sees income AFTER D&A. Tax EBIT — 25% × ${EBIT} = ${EBIT * t} — or the build overstates the government's take and understates FCF.`;
    }
    return { title: "Exhibit A — Unlevered Free Cash Flow build ($M)", rows, flawIdx, correct, why };
  }
  // Paper-LBO bridge
  const E0 = pick([80, 100, 120]), entry = pick([8, 9, 10]), debtPct = pick([50, 60]), gf = pick([1.25, 1.5]), exitX = entry + pick([0, 1]);
  const EV0 = E0 * entry, D = EV0 * debtPct / 100, Q0 = EV0 - D, EN = E0 * gf, EVN = exitX * EN;
  const err = pick(["evexit", "eqcheck", "mombase", "exitbase"]);
  let rows, flawIdx, correct, why;
  if (err === "evexit") {
    rows = [["Entry EBITDA", E0], [`Entry EV (${entry.toFixed(1)}x)`, EV0], [`Debt (${debtPct}%)`, D], ["Equity check", Q0], ["Exit EBITDA", EN], [`Exit EV (${exitX.toFixed(1)}x)`, EVN], ["Exit equity", EVN], ["Multiple of money", +(EVN / Q0).toFixed(2)]];
    flawIdx = 6; correct = `Exit equity = ${EVN} − ${D} = ${EVN - D}`;
    why = "The debt doesn't vanish at exit — the lenders are repaid before the sponsor sees a dollar. Exit equity is exit ENTERPRISE value less net debt. Taking EV as the equity proceeds is the single most common paper-LBO error, and it flatters the multiple of money badly.";
  } else if (err === "eqcheck") {
    rows = [["Entry EBITDA", E0], [`Entry EV (${entry.toFixed(1)}x)`, EV0], [`Debt (${debtPct}%)`, D], ["Equity check", EV0 + D], ["Exit EBITDA", EN], [`Exit EV (${exitX.toFixed(1)}x)`, EVN], ["Exit equity", EVN - D], ["Multiple of money", +((EVN - D) / (EV0 + D)).toFixed(2)]];
    flawIdx = 3; correct = `Equity check = ${EV0} − ${D} = ${Q0}`;
    why = "Sources must equal uses: the purchase price is funded by debt PLUS equity, so the sponsor's check is EV minus the debt raised — not EV plus it. Adding debt to EV confuses what the company costs with how the cost is split.";
  } else if (err === "mombase") {
    rows = [["Entry EBITDA", E0], [`Entry EV (${entry.toFixed(1)}x)`, EV0], [`Debt (${debtPct}%)`, D], ["Equity check", Q0], ["Exit EBITDA", EN], [`Exit EV (${exitX.toFixed(1)}x)`, EVN], ["Exit equity", EVN - D], ["Multiple of money", +((EVN - D) / EV0).toFixed(2)]];
    flawIdx = 7; correct = `MoM = ${EVN - D} ÷ ${Q0} = ${((EVN - D) / Q0).toFixed(2)}x`;
    why = "Multiple of money is measured on the sponsor's EQUITY — cash out over cash in. Dividing exit equity by entry enterprise value mixes claims: the denominator must be the equity check, not the whole purchase price. This error understates returns and hides what leverage did.";
  } else {
    const wrongEVN = exitX * E0;
    rows = [["Entry EBITDA", E0], [`Entry EV (${entry.toFixed(1)}x)`, EV0], [`Debt (${debtPct}%)`, D], ["Equity check", Q0], ["Exit EBITDA", EN], [`Exit EV (${exitX.toFixed(1)}x)`, wrongEVN], ["Exit equity", wrongEVN - D], ["Multiple of money", +((wrongEVN - D) / Q0).toFixed(2)]];
    flawIdx = 5; correct = `Exit EV = ${exitX.toFixed(1)}x × ${EN} = ${EVN}`;
    why = `The exit multiple applies to EXIT-year EBITDA (${EN}), not the EBITDA the sponsor bought (${E0}). Using the entry-year figure throws away the growth the whole hold period generated — the model literally forgets why the deal worked.`;
  }
  return { title: "Exhibit B — Paper LBO bridge ($M)", rows, flawIdx, correct, why };
}
function RedlineExhibit() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000));
  const [pickIdx, setPickIdx] = useState(null);
  const [done, setDone] = useState(false);
  const X = buildRedline(seed);
  const fmtV = v => typeof v === "number" ? (v < 0 ? `(${Math.abs(+v.toFixed(2))})` : String(+v.toFixed(2))) : v;
  const fresh = () => { setSeed(s => s + 1); setPickIdx(null); setDone(false); };
  const submit = () => {
    if (pickIdx === null || done) return;
    setDone(true);
    recordDrillResult({ src: "redline", qid: String(seed), ok: pickIdx === X.flawIdx, front: `Redline: find the planted error in "${X.title}"`, back: `Flawed line: "${X.rows[X.flawIdx][0]}" — ${X.correct}`, given: `picked "${X.rows[pickIdx][0]}"` });
  };
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 6 }}>One line of this finished exhibit is wrong <b>on principle</b> — the arithmetic is internally consistent with the mistake, so a calculator won't save you. Mark the flawed line and submit the redline.</p>
    <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", margin: "10px 0 6px" }}>{X.title}</div>
    <div style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -4, borderRadius: 2, padding: "10px 6px", background: "#fffdf9", marginBottom: 12 }}>
      {X.rows.map(([label, val], i) => {
        const isFlaw = done && i === X.flawIdx, isPick = i === pickIdx;
        return <button key={i} onClick={() => { if (!done) { setPickIdx(i); } }} disabled={done} style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 12, alignItems: "baseline", background: isFlaw ? "rgba(178,52,43,0.06)" : isPick && !done ? "rgba(13,109,86,0.06)" : "none", border: "none", borderLeft: `2px solid ${isFlaw ? "#b2342b" : isPick ? "#0d6d56" : "transparent"}`, cursor: done ? "default" : "pointer", padding: "5px 10px", textAlign: "left" }}>
          <span style={{ fontSize: 12, color: "#33302c", textDecoration: isFlaw ? "line-through #b2342b" : "none" }}>{label}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: isFlaw ? "#b2342b" : "#33302c", textDecoration: isFlaw ? "line-through #b2342b" : "none" }}>{fmtV(val)}</span>
        </button>;
      })}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: done ? 14 : 0, alignItems: "center", flexWrap: "wrap" }}>
      <button onClick={submit} disabled={pickIdx === null || done} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", opacity: pickIdx === null || done ? 0.5 : 1 }}>Submit the redline</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New exhibit</button>
      {pickIdx === null && !done && <span style={{ fontSize: 9.5, color: "#a2977f" }}>Click the line you'd flag.</span>}
    </div>
    {done && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: pickIdx === X.flawIdx ? "#0d6d56" : "#b2342b" }}>{pickIdx === X.flawIdx ? "Caught it — the redline stands" : `Missed — you flagged "${X.rows[pickIdx][0]}", which is sound`}</div>
      <div style={{ fontSize: 11.5, color: "#33302c", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>Correction: {X.correct}</div>
      <p style={{ fontSize: 12, color: "#4a443c", lineHeight: 1.7 }}>{X.why}</p>
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>Reviewing a model for errors is the actual first-year job. Eight planted-error types across two exhibit families, seeded fresh daily.</p>
  </div>;
}

function EditionStrip() {
  useLearnTick();
  const ed = lsGet("mjb_editions", {});
  const total = Object.keys(ed).length, streak = computeStreak(ed);
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const cells = [];
  for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) { const d = new Date(y, m, i); cells.push({ iso: toISO(d), i, future: d > now, trading: isTradingDay(d), done: !!ed[toISO(d)] }); }
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "11px 20px", border: "1px solid #e3d5bf", borderRadius: 10, background: "linear-gradient(145deg,#fffdf9,#fbf5ec)", marginBottom: 16, boxShadow: "0 4px 16px rgba(64,52,32,0.05)" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase" }}>The Desk</span>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: "#262421" }}>{total ? `Edition No. ${total}` : "Edition No. 1 awaits"}</span>
      <Info text="Completing any daily unit — the Question of the Day, a drill, a docket review, a filed call — puts the day's edition 'to bed' and fills its ink square. The streak counts NYSE trading days only: weekends and market holidays are free, and one missed trading day per week is quietly forgiven as a press holiday." />
      {streak > 1 && <span style={{ fontSize: 10, color: "#6f675c" }}>{streak} consecutive trading days{ed[todayISO()] ? "" : " — today still open"}</span>}
      {total > 0 && streak <= 1 && <span style={{ fontSize: 10, color: "#8a8072" }}>{ed[todayISO()] ? "today is put to bed" : "today's edition is still open"}</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 5 }}>{now.toLocaleDateString("en-US", { month: "short" })}</span>
      {cells.map(c => <span key={c.i} title={`${c.iso}${!c.trading ? " — market closed" : c.done ? " — put to bed" : c.future ? "" : " — open"}`} style={{ width: 7, height: 7, borderRadius: 1, flexShrink: 0, background: c.done ? "#0d6d56" : "transparent", border: `1px solid ${!c.trading ? "#eee3d0" : c.future ? "#e3d5bf" : "#b8ab97"}` }} />)}
    </div>
  </div>;
}

function ReviewDocket() {
  useLearnTick();
  const [rev, setRev] = useState(false);
  const cards = lsGet("mjb_srs", []);
  const due = cards.filter(c => c.due <= todayISO()).slice(0, 10);
  const card = due[0];
  const grade = q => { const all = lsGet("mjb_srs", []); const i = all.findIndex(x => x.id === card.id); if (i >= 0) { all[i] = sm2(all[i], q); lsSet("mjb_srs", all); } recordEdition("docket"); setRev(false); learnPing(); };
  if (!cards.length) return <p style={{ fontSize: 12, color: "#8a8072", lineHeight: 1.7, padding: "6px 0" }}>Empty — for now. Miss or mark a question <i>shaky</i> anywhere on the site and it files here for spaced review: tomorrow, then six days, then widening intervals.</p>;
  if (!due.length) {
    const next = cards.map(c => c.due).sort()[0];
    return <div style={{ padding: "6px 0" }}>
      <div style={{ fontSize: 10, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Docket clear</div>
      <p style={{ fontSize: 12, color: "#8a8072", lineHeight: 1.7 }}>{cards.length} card{cards.length === 1 ? "" : "s"} in circulation · next due {next}.</p>
    </div>;
  }
  return <div>
    <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{due.length} due today · from {CAT_LABELS[card.from] || card.from}</div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, color: "#262421", lineHeight: 1.45, marginBottom: 12 }}>{card.front}</p>
    <Redacted revealed={rev} onReveal={() => setRev(true)}>{card.back}</Redacted>
    {rev && <div style={{ marginTop: 12 }}>
      <GradeBar done={false} onGrade={g => grade({ missed: 1, shaky: 3, solid: 5 }[g])} />
    </div>}
    <SourceLine>SM-2 scheduling · misses return tomorrow, solids widen the interval</SourceLine>
  </div>;
}

function ErrataColumn() {
  useLearnTick();
  const items = lsGet("mjb_errata", []);
  const saveRule = (i, rule) => { const e = lsGet("mjb_errata", []); if (e[i]) { e[i] = { ...e[i], rule }; lsSet("mjb_errata", e); } };
  if (!items.length) return <p style={{ fontSize: 12, color: "#8a8072", lineHeight: 1.7, padding: "6px 0" }}>No corrections on record. When you miss a question, it is filed here — with room for a one-line rule so the same mistake isn't made twice.</p>;
  return <div>
    {items.slice(0, 6).map((e, i) => <div key={`${e.d}-${i}`} style={{ borderTop: i ? "1px solid #efe4d2" : "none", padding: "9px 0" }}>
      <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        <span style={{ color: "#990f3d" }}>Correction</span><span style={{ color: "#a2977f" }}> · {e.d} · {e.src}</span>
      </div>
      <div style={{ fontSize: 11.5, color: "#33302c", lineHeight: 1.55, marginBottom: 5 }}>{e.prompt.length > 110 ? e.prompt.slice(0, 110) + "…" : e.prompt}</div>
      <input defaultValue={e.rule} onBlur={ev => saveRule(i, ev.target.value.trim())} placeholder="Rule for next time…" style={{ ...S.input, fontSize: 11, padding: "5px 9px", fontStyle: "italic", background: "transparent", border: "none", borderBottom: "1px dotted #ddcfb8", borderRadius: 0 }} />
    </div>)}
    {items.length > 6 && <div style={{ fontSize: 9, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginTop: 8 }}>+ {items.length - 6} earlier corrections on file</div>}
  </div>;
}

// Watchlist signal cheat-sheet, restructured as drillable cue/read pairs
const SIGNALS = [
  { cue: "TLT drops while SPY stays flat", read: "Rates are rising without an equity read-through yet — financing is getting more expensive, and deal flow tends to slow." },
  { cue: "GLD and TLT spike together", read: "Classic risk-off: money is running to safety on both fronts at once — the market is scared." },
  { cue: "IWM diverges from SPY", read: "Small-cap sentiment is moving on its own — a read on domestic risk appetite and the middle-market PE pipeline." },
  { cue: "QQQ outpaces SPY", read: "Growth and tech rotation — long-duration equities are being bid, usually on falling rate expectations." },
  { cue: "JPM moves hard on earnings", read: "A read-through on credit conditions and investment-banking activity — the banks report first and set the tone." },
  { cue: "UUP grinds higher", read: "The dollar is strengthening — pressure on multinational earnings, commodities, and anything emerging-market." },
  { cue: "NVDA gaps on guidance", read: "An AI capex cycle signal — hyperscaler spending intentions ripple through the entire tech supply chain." },
  { cue: "TLT and SPY rise together", read: "Goldilocks — rates falling while equities climb, the market pricing easier policy without a growth scare." },
];
function QCard({ q, src, done }) {
  const [rev, setRev] = useState(false);
  const [marked, setMarked] = useState(false);
  return <div>
    <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: "#262421", lineHeight: 1.45, marginBottom: 10 }}>{q.q}</p>
    <Redacted revealed={rev} onReveal={() => setRev(true)}>{q.a}</Redacted>
    {rev && <div style={{ marginTop: 10 }}>
      <GradeBar done={marked || done} onGrade={g => { recordSelfGrade({ src, qid: q.id, grade: g, front: q.q, back: q.a }); setMarked(true); }} />
    </div>}
  </div>;
}
const DrillStation = ({ n, done, children }) => <div style={{ borderTop: "1px solid #efe4d2", padding: "13px 0 11px" }}>
  <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 8, color: done ? "#0d6d56" : "#a2977f" }}>Station {n}{done ? " · cleared" : ""}</div>
  {children}
</div>;
const DRILL_EPOCH = Math.floor(Date.UTC(2026, 6, 1) / 86400000); // Edition No. 1 = July 1, 2026
function DailyDrill({ onGoPuzzle }) {
  useLearnTick();
  const bank = useTechBank();
  const [sigRev, setSigRev] = useState(false);
  const [sigMarked, setSigMarked] = useState(false);
  if (!bank.length) return <AwaitingWire />;
  const day = Math.floor(Date.now() / 86400000);
  const no = day - DRILL_EPOCH + 1;
  const att = lsGet("mjb_attempts", []).filter(a => a.d === todayISO());
  const r = mulberry32(day * 11 + 5);
  const qotdId = bank[day % bank.length].id;
  const picks = [1, 2, 3].map(dd => { const pool = bank.filter(x => x.d === dd && x.id !== qotdId); return pool.length ? pool[Math.floor(r() * pool.length)] : null; }).filter(Boolean);
  const sigIdx = day % SIGNALS.length, sig = SIGNALS[sigIdx];
  const done = {
    tech: picks.map(p => att.some(a => a.src === "drill" && a.qid === p.id)),
    sig: att.some(a => a.src === "signals" && a.qid === String(sigIdx)),
    ripple: att.some(a => a.src === "ripple" && String(a.qid).endsWith(`-${day}`)),
    puzzle: att.some(a => a.src === "puzzle" && a.qid === String(day)),
  };
  const total = picks.length + 3;
  const solved = done.tech.filter(Boolean).length + (done.sig ? 1 : 0) + (done.ripple ? 1 : 0) + (done.puzzle ? 1 : 0);
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, color: "#262421" }}>The Daily Drill, No. {no}</span>
      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", color: solved === total ? "#0d6d56" : "#8a8072" }}>{solved === total ? "Edition put to bed ∎" : `${solved} of ${total} stations cleared`}</span>
    </div>
    <p style={{ fontSize: 10.5, color: "#8a8072", fontStyle: "italic", marginBottom: 10 }}>Six stations, mixed on purpose — naming the method is half the interview.</p>
    {picks.map((p, i) => <DrillStation key={p.id} n={i + 1} done={done.tech[i]}><QCard q={p} src="drill" done={done.tech[i]} /></DrillStation>)}
    <DrillStation n={4} done={done.sig}>
      <p style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: "#262421", lineHeight: 1.45, marginBottom: 10 }}>{sig.cue} — what is the tape telling you?</p>
      <Redacted revealed={sigRev} onReveal={() => setSigRev(true)}>{sig.read}</Redacted>
      {sigRev && <div style={{ marginTop: 10 }}>
        <GradeBar done={sigMarked || done.sig} onGrade={g => { recordSelfGrade({ src: "signals", qid: String(sigIdx), grade: g, front: `${sig.cue} — what is the tape telling you?`, back: sig.read }); setSigMarked(true); }} />
      </div>}
    </DrillStation>
    <DrillStation n={5} done={done.ripple}><ThreeStatementRipple /></DrillStation>
    <DrillStation n={6} done={done.puzzle}>
      <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.7 }}>Today's paper LBO is waiting at the <button onClick={onGoPuzzle} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#0d6d56", fontSize: 12.5, fontFamily: "inherit", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>Puzzle Corner</button> — work it on paper and check it there.</p>
    </DrillStation>
    <SourceLine>One edition per day, same for every reader · stations drawn from the house generators · interleaved on purpose</SourceLine>
  </div>;
}

// ============ MACRO DATA (FRED + US TREASURY) ============
function useFred(ids) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const key = `mjb_fred_${ids.replace(/[^A-Z0-9]/g, "")}`;
        const cached = cacheGet(key, 360);
        if (cached) { if (on) setData(cached); return; }
        const r = await fetch(`/api/fred?id=${ids}`);
        if (!r.ok) throw 0;
        const d = await r.json();
        if (d && !d.error && on) { setData(d); cacheSet(key, d); }
      } catch {}
    })();
    return () => { on = false; };
  }, [ids]);
  return data;
}

function MacroLedger() {
  const d = useFred("CPIAUCSL,UNRATE,FEDFUNDS,DGS10,MORTGAGE30US");
  const monthLabel = iso => { const [y, m] = iso.split("-"); return new Date(+y, +m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }); };
  const dayLabel = iso => { const [y, m, dd] = iso.split("-"); return new Date(+y, +m - 1, +dd).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  const rows = [];
  if (d) {
    const cpi = d.CPIAUCSL || [];
    if (cpi.length > 14) {
      const yoy = (cpi[cpi.length - 1][1] / cpi[cpi.length - 13][1] - 1) * 100;
      const prior = (cpi[cpi.length - 2][1] / cpi[cpi.length - 14][1] - 1) * 100;
      rows.push({ label: "CPI inflation", sub: "year over year", v: `${yoy.toFixed(1)}%`, delta: yoy - prior, ds: `${Math.abs(yoy - prior).toFixed(1)}pp`, asof: monthLabel(cpi[cpi.length - 1][0]) });
    }
    const simple = (key, label, sub, fmt, dfmt, dateFn) => {
      const s = d[key] || [];
      if (s.length < 2) return;
      const delta = s[s.length - 1][1] - s[s.length - 2][1];
      rows.push({ label, sub, v: fmt(s[s.length - 1][1]), delta, ds: dfmt(Math.abs(delta)), asof: dateFn(s[s.length - 1][0]) });
    };
    simple("UNRATE", "Unemployment", "U-3 rate", v => `${v.toFixed(1)}%`, x => `${x.toFixed(1)}pp`, monthLabel);
    simple("FEDFUNDS", "Fed funds", "effective, monthly avg", v => `${v.toFixed(2)}%`, x => `${(x * 100).toFixed(0)}bp`, monthLabel);
    simple("DGS10", "10-year Treasury", "constant maturity", v => `${v.toFixed(2)}%`, x => `${(x * 100).toFixed(0)}bp`, dayLabel);
    simple("MORTGAGE30US", "30-year mortgage", "weekly avg", v => `${v.toFixed(2)}%`, x => `${(x * 100).toFixed(0)}bp`, dayLabel);
  }
  if (!rows.length) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>The monthly numbers every morning meeting references — CPI, unemployment, Fed funds, the 10-year, mortgage rates — each with its release dateline.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>Live via FRED in production</span></p>;
  return <div>
    {rows.map((r, i) => <div key={r.label} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "8px 2px", borderTop: i ? "1px solid #efe4d2" : "none" }}>
      <div style={{ flex: 1, minWidth: 0 }}><span style={{ fontSize: 12.5, color: "#33302c", fontWeight: 600 }}>{r.label}</span><span style={{ fontSize: 10, color: "#8a8072", marginLeft: 8 }}>{r.sub}</span></div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#262421", textAlign: "right" }}>{r.v}</span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, minWidth: 62, textAlign: "right", color: Math.abs(r.delta) < 0.005 ? "#8a8072" : r.delta > 0 ? "#990f3d" : "#0d6d56" }}>{Math.abs(r.delta) < 0.005 ? "unch" : `${r.delta > 0 ? "▲" : "▼"} ${r.ds}`}</span>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, color: "#a2977f", minWidth: 58, textAlign: "right", letterSpacing: 0.5 }}>{r.asof}</span>
    </div>)}
    <SourceLine>Source: FRED, Federal Reserve Bank of St. Louis · rising prints in claret, easing in teal · 12-hr cache</SourceLine>
  </div>;
}

// The one-glance risk read: how far the S&P 500 sits below its highest close in the
// window, how many sessions it has been underwater, and where the VIX ranks in its
// own recent range. All keyless via FRED (SP500 + VIXCLS), both in the api/fred allowlist.
function DrawdownMeter() {
  const d = useFred("SP500,VIXCLS");
  const sp = (d && d.SP500) || [];
  const vx = (d && d.VIXCLS) || [];
  if (sp.length < 30) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>How far the S&P 500 sits below its recent peak, how long it has spent underwater, and where the VIX ranks in its own recent range — the one-glance risk read.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>Live via FRED in production</span></p>;
  const vals = sp.map(r => r[1]);
  let peakIdx = 0;
  for (let i = 1; i < vals.length; i++) if (vals[i] >= vals[peakIdx]) peakIdx = i;
  const peak = vals[peakIdx], curr = vals[vals.length - 1];
  const dd = (curr / peak - 1) * 100;
  const atHigh = dd > -0.05;
  const daysUW = vals.length - 1 - peakIdx;
  const lo = Math.min(...vals), span = peak - lo || 1;
  const pos = Math.max(0, Math.min(100, ((curr - lo) / span) * 100));
  const dayLabel = iso => { const [y, m, dd2] = iso.split("-"); return new Date(+y, +m - 1, +dd2).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  const peakDate = sp[peakIdx][0], asof = sp[sp.length - 1][0];
  const months = Math.max(1, Math.round((new Date(asof) - new Date(sp[0][0])) / 2.6298e9));
  let vixNow = null, vixPct = null;
  if (vx.length > 20) { const vv = vx.map(r => r[1]); vixNow = vv[vv.length - 1]; vixPct = Math.round(vv.filter(v => v <= vixNow).length / vv.length * 100); }
  const stat = (label, value, sub, color) => <div style={{ minWidth: 90 }}>
    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>{label}</div>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 600, color: color || "#262421", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 9.5, color: "#a2977f", marginTop: 4 }}>{sub}</div>
  </div>;
  const rule = () => <div style={{ width: 1, alignSelf: "stretch", background: "#efe4d2" }} />;
  return <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch" }}>
      {stat("Off peak", atHigh ? "0.0%" : `${dd.toFixed(1)}%`, atHigh ? "at a window high" : `S&P ${Math.round(curr).toLocaleString()}`, atHigh ? "#0d6d56" : "#b2342b")}
      {rule()}
      {stat("Underwater", atHigh ? "0" : String(daysUW), atHigh ? "fresh highs" : `sessions since ${dayLabel(peakDate)}`, "#262421")}
      {vixNow != null && rule()}
      {vixNow != null && stat("VIX", vixNow.toFixed(1), `${vixPct}th pctile, ${months}-mo`, vixPct >= 80 ? "#b2342b" : vixPct <= 20 ? "#0d6d56" : "#262421")}
      <div style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", marginBottom: 4 }}><span>{months}-mo low</span><span>peak</span></div>
        <div style={{ position: "relative", height: 4, background: "#ece1cd", borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pos}%`, background: atHigh ? "#0d6d56" : "linear-gradient(90deg,#b2342b,#b0741e)", borderRadius: 2 }} />
          <span style={{ position: "absolute", left: `calc(${pos}% - 1px)`, top: -3, width: 2, height: 10, background: "#262421" }} />
        </div>
      </div>
    </div>
    <SourceLine>Source: FRED — S&P 500 (daily close) & CBOE VIX · {months}-month lookback · drawdown measured from the highest close in the window · 12-hr cache</SourceLine>
  </div>;
}

function CreditStrip() {
  const d = useFred("BAMLH0A0HYM2,T10YIE,T10Y2Y");
  if (!d) return null;
  const items = [];
  const push = (key, label, fmt) => {
    const s = d[key] || [];
    if (s.length < 2) return;
    const v = s[s.length - 1][1], delta = v - s[s.length - 2][1];
    items.push({ label, v: fmt(v), up: delta > 0.0001, flat: Math.abs(delta) <= 0.0001 });
  };
  push("BAMLH0A0HYM2", "HY", v => `${Math.round(v * 100)}bp`);
  push("T10YIE", "BE10", v => `${v.toFixed(2)}%`);
  push("T10Y2Y", "2s10s", v => `${v >= 0 ? "+" : ""}${Math.round(v * 100)}bp`);
  if (!items.length) return null;
  return <>{items.map(x => <span key={x.label} style={{ display: "inline-flex", gap: 6 }}>
    <span style={{ color: "#7d7568" }}>{x.label}</span>
    <span style={{ color: "#cfc5b4" }}>{x.v}</span>
    {!x.flat && <span style={{ color: x.up ? "#e07a70" : "#3ecf8e" }}>{x.up ? "▲" : "▼"}</span>}
  </span>)}</>;
}

// US Treasury daily par yield curve — keyless, CORS-open, browser-direct.
const TENORS = [[1, "1M"], [3, "3M"], [6, "6M"], [12, "1Y"], [24, "2Y"], [36, "3Y"], [60, "5Y"], [84, "7Y"], [120, "10Y"], [240, "20Y"], [360, "30Y"]];
function useTreasury() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_tsy_curve", 720);
        if (cached) { if (on) setRows(cached); return; }
        const y = new Date().getFullYear();
        const url = yy => `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${yy}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${yy}&page&_format=csv`;
        const texts = await Promise.all([y, y - 1].map(yy => fetch(url(yy)).then(r => r.ok ? r.text() : "").catch(() => "")));
        const all = [];
        for (const t of texts) {
          if (!t) continue;
          const lines = t.trim().split("\n");
          const header = (lines[0].match(/("[^"]*"|[^,]+)/g) || []).map(s => s.replace(/"/g, "").trim());
          const cols = header.map(h => { const m = h.match(/^([\d.]+)\s*(Mo|Yr)$/i); return m ? Math.round(parseFloat(m[1]) * (/yr/i.test(m[2]) ? 12 : 1)) : null; });
          for (const line of lines.slice(1)) {
            const cells = (line.match(/("[^"]*"|[^,]+)/g) || []).map(s => s.replace(/"/g, "").trim());
            const dm = cells[0] && cells[0].match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (!dm) continue;
            const p = {};
            cols.forEach((mo, i) => { if (mo) { const v = parseFloat(cells[i]); if (!isNaN(v)) p[mo] = v; } });
            if (p[24] != null && p[120] != null) all.push({ date: `${dm[3]}-${dm[1]}-${dm[2]}`, p });
          }
        }
        if (!all.length) return;
        all.sort((a, b) => a.date.localeCompare(b.date));
        if (on) { setRows(all); cacheSet("mjb_tsy_curve", all); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  return rows;
}

function RatesPlate() {
  const rows = useTreasury();
  if (!rows || rows.length < 2) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>Today's full Treasury par curve against one month and one year ago, with the 2s10s dateline.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>Awaiting the Treasury wire</span></p>;
  const latest = rows[rows.length - 1];
  const mAgo = rows.length > 22 ? rows[rows.length - 22] : null;
  const yAgo = rows.length > 251 ? rows[rows.length - 251] : rows[0];
  const curves = [
    { row: latest, color: "#262421", w: 1.8, label: `Today (${latest.date.slice(5)})` },
    mAgo && { row: mAgo, color: "#b8ab97", w: 1.2, label: "1 month ago" },
    yAgo && yAgo !== mAgo && { row: yAgo, color: "#0d6d56", w: 1.2, dash: "5 4", label: "1 year ago" },
  ].filter(Boolean);
  const vals = curves.flatMap(c => TENORS.map(([m]) => c.row.p[m]).filter(v => v != null));
  const lo = Math.floor(Math.min(...vals) * 2) / 2 - 0.25, hi = Math.ceil(Math.max(...vals) * 2) / 2 + 0.25;
  const W = 560, H = 180, PL = 34, PB = 22, PT = 8;
  const x = i => PL + (i / (TENORS.length - 1)) * (W - PL - 10);
  const yy = v => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const path = row => TENORS.map(([m], i) => row.p[m] == null ? null : `${i === 0 || row.p[TENORS[i - 1][0]] == null ? "M" : "L"}${x(i).toFixed(1)},${yy(row.p[m]).toFixed(1)}`).filter(Boolean).join(" ");
  const spread = latest.p[120] - latest.p[24];
  let streak = 0;
  for (let i = rows.length - 1; i >= 0; i--) { const s = rows[i].p[120] - rows[i].p[24]; if ((s >= 0) === (spread >= 0)) streak++; else break; }
  const gridVals = []; for (let v = Math.ceil(lo * 2) / 2; v <= hi; v += 0.5) gridVals.push(+v.toFixed(2));
  return <div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="US Treasury par yield curve, today versus one month and one year ago">
      {gridVals.map(v => <g key={v}><line x1={PL} x2={W - 10} y1={yy(v)} y2={yy(v)} stroke="#e9ddc9" strokeWidth="0.7" /><text x={PL - 5} y={yy(v) + 3} textAnchor="end" fontSize="8" fill="#a2977f" fontFamily="'JetBrains Mono',monospace">{v.toFixed(1)}</text></g>)}
      {TENORS.map(([m, l], i) => <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="8" fill="#8a8072" fontFamily="'JetBrains Mono',monospace">{l}</text>)}
      {curves.map(c => <path key={c.label} d={path(c.row)} fill="none" stroke={c.color} strokeWidth={c.w} strokeDasharray={c.dash || "none"} strokeLinejoin="round" strokeLinecap="round" />)}
      {TENORS.map(([m], i) => latest.p[m] == null ? null : <circle key={m} cx={x(i)} cy={yy(latest.p[m])} r="1.9" fill="#262421" />)}
    </svg>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "8px 0 2px" }}>
      {curves.map(c => <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 9, color: "#6f675c", fontFamily: "'JetBrains Mono',monospace" }}><span style={{ width: 16, borderTop: `2px ${c.dash ? "dashed" : "solid"} ${c.color}` }} />{c.label}</span>)}
    </div>
    <p style={{ fontSize: 11.5, color: "#4a443c", marginTop: 8, lineHeight: 1.6 }}>The 2s10s spread is <span style={{ fontFamily: "'JetBrains Mono',monospace", color: spread >= 0 ? "#0d6d56" : "#990f3d", fontWeight: 600 }}>{spread >= 0 ? "+" : ""}{Math.round(spread * 100)}bp</span> — {spread >= 0 ? "positive" : "inverted"} for {streak} consecutive session{streak === 1 ? "" : "s"}.</p>
    <SourceLine>Source: U.S. Department of the Treasury, daily par yield curve · as of {latest.date} · fetched directly, cached 12 hrs</SourceLine>
  </div>;
}

// FX (ECB reference rates via Frankfurter) + crypto (CoinGecko) — both keyless and CORS-open, browser-direct.
function CrossAssetRows() {
  const [fx, setFx] = useState(null);
  const [cr, setCr] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_fx", 60); if (cached) { if (on) setFx(cached); return; }
        const r = await fetch(`https://api.frankfurter.dev/v1/${addDaysISO(-8)}..?base=USD&symbols=EUR,GBP,JPY,CNY`);
        if (!r.ok) return;
        const d = await r.json();
        const dates = Object.keys(d.rates || {}).sort();
        if (dates.length < 2) return;
        const cur = d.rates[dates[dates.length - 1]], prev = d.rates[dates[dates.length - 2]];
        const out = [
          { l: "EUR/USD", v: 1 / cur.EUR, p: 1 / prev.EUR, dp: 4 },
          { l: "GBP/USD", v: 1 / cur.GBP, p: 1 / prev.GBP, dp: 4 },
          { l: "USD/JPY", v: cur.JPY, p: prev.JPY, dp: 2 },
          { l: "USD/CNY", v: cur.CNY, p: prev.CNY, dp: 3 },
        ].map(x => ({ l: x.l, v: x.v, dp: x.dp, up: x.v > x.p, flat: Math.abs(x.v - x.p) < 1e-6 }));
        if (on) { setFx(out); cacheSet("mjb_fx", out); }
      } catch {}
    })();
    (async () => {
      try {
        const cached = cacheGet("mjb_crypto", 10); if (cached) { if (on) setCr(cached); return; }
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true");
        if (!r.ok) return;
        const d = await r.json();
        const out = [["bitcoin", "BTC"], ["ethereum", "ETH"], ["solana", "SOL"]].filter(([k]) => d[k] && d[k].usd).map(([k, l]) => ({ l, v: d[k].usd, ch: d[k].usd_24h_change || 0 }));
        if (on && out.length) { setCr(out); cacheSet("mjb_crypto", out); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  if (!fx && !cr) return null;
  return <div style={{ borderBottom: "1px solid #ddcfb8", padding: "7px 2px 8px", marginTop: -14, marginBottom: 22, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 22px", fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, animation: "fadeUp 0.5s ease both" }}>
    {(fx || []).map(x => <span key={x.l} style={{ display: "inline-flex", gap: 7, alignItems: "baseline" }}>
      <span style={{ color: "#8a8072", fontSize: 8.5, letterSpacing: 1 }}>{x.l}</span>
      <span style={{ color: "#33302c" }}>{x.v.toFixed(x.dp)}</span>
      {!x.flat && <span style={{ color: x.up ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{x.up ? "▲" : "▼"}</span>}
    </span>)}
    {(cr || []).map(x => <span key={x.l} style={{ display: "inline-flex", gap: 7, alignItems: "baseline" }}>
      <span style={{ color: "#8a8072", fontSize: 8.5, letterSpacing: 1 }}>{x.l}</span>
      <span style={{ color: "#33302c" }}>${x.v >= 1000 ? Math.round(x.v).toLocaleString() : x.v.toFixed(2)}</span>
      <span style={{ color: x.ch >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{x.ch >= 0 ? "▲" : "▼"} {Math.abs(x.ch).toFixed(1)}%</span>
    </span>)}
    <span style={{ marginLeft: "auto", fontSize: 7.5, color: "#a2977f", letterSpacing: 0.5 }}>RATES: ECB VIA FRANKFURTER · CRYPTO: COINGECKO</span>
  </div>;
}

// CNN Fear & Greed — unofficial keyless JSON, CORS-open; graceful null on any failure.
function useFearGreed() {
  const [fg, setFg] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_fg", 60); if (cached) { if (on) setFg(cached); return; }
        const r = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata");
        if (!r.ok) return;
        const d = await r.json();
        const s = d && d.fear_and_greed;
        if (!s || typeof s.score !== "number") return;
        const out = { score: s.score, rating: s.rating || "", prev: s.previous_close };
        if (on) { setFg(out); cacheSet("mjb_fg", out); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  return fg;
}

// SEC EDGAR current-filings column (public domain), via api/edgar.js
const FORM_GLOSS = { "8-K": "material event", "13D": "activist / >5% stake", "S-1": "IPO registration" };
const FORM_COLOR = { "8-K": "#1f5a9e", "13D": "#990f3d", "S-1": "#b0741e" };
function FilingsWire() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const cached = cacheGet("mjb_edgar", 10); if (cached) { if (on) setItems(cached); return; }
        const r = await fetch("/api/edgar?forms=8-K,13D,S-1");
        if (!r.ok) return;
        const d = await r.json();
        if (d.items && d.items.length && on) { setItems(d.items); cacheSet("mjb_edgar", d.items); }
      } catch {}
    })();
    return () => { on = false; };
  }, []);
  const clean = t => t.replace(/^[^-]+-\s*/, "").replace(/\s*\(\d{7,}\)\s*/g, " ").replace(/\((Filer|Subject|Reporting Owner|Reporting)\)/gi, "").replace(/\s{2,}/g, " ").trim();
  const when = iso => { try { const d = new Date(iso); return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch { return ""; } };
  if (!items) return <p style={{ color: "#8a8072", fontSize: 12, textAlign: "center", padding: "12px 0", lineHeight: 1.6 }}>The primary-source wire — 8-Ks, activist stakes, and IPO registrations as they hit SEC EDGAR, continuously.<br /><span style={{ fontSize: 10, color: "#a2977f" }}>Live in production</span></p>;
  return <div>
    {items.slice(0, 14).map((f, i) => <a key={i} href={f.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "7px 2px", borderTop: i ? "1px solid #efe4d2" : "none", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(13,109,86,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, minWidth: 74 }}>{when(f.updated)}</span>
      <span style={{ fontSize: 8.5, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, color: FORM_COLOR[f.form] || "#6f675c", flexShrink: 0, minWidth: 34, fontWeight: 600 }}>{f.form}</span>
      <span style={{ fontSize: 11.5, color: "#33302c", lineHeight: 1.5, flex: 1 }}>{clean(f.title)}<span style={{ fontSize: 8.5, color: "#a2977f", marginLeft: 7, fontStyle: "italic" }}>{FORM_GLOSS[f.form]}</span></span>
    </a>)}
    <SourceLine>Source: SEC EDGAR, latest filings · public domain · 10-min cache · filings link to sec.gov</SourceLine>
  </div>;
}

function PuzzleCorner() {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / 86400000)); // today's edition; "New problem" deals more
  const [ans, setAns] = useState({ eq: "", exit: "", mom: "", irr: "" });
  const [checked, setChecked] = useState(false);
  // Fading scaffold: 3 consecutive clean solves promote a level, any miss demotes one.
  const [scaf, setScaf] = useState(() => (lsGet("mjb_scaffold", {}).puzzle || { m: 0, streak: 0 }));
  const bumpScaffold = allOk => {
    const next = allOk
      ? (scaf.streak + 1 >= 3 ? { m: Math.min(4, scaf.m + 1), streak: 0 } : { m: scaf.m, streak: scaf.streak + 1 })
      : { m: Math.max(0, scaf.m - 1), streak: 0 };
    setScaf(next);
    const all = lsGet("mjb_scaffold", {}); all.puzzle = next; lsSet("mjb_scaffold", all);
    return next;
  };
  const r = mulberry32(seed);
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const E0 = pick([50, 75, 100, 125, 150, 200]);
  const entry = pick([6, 7, 8, 9, 10, 11, 12]);
  const debtPct = pick([50, 55, 60, 65, 70]);
  const factor = pick([1.25, 1.4, 1.5, 1.6, 1.75, 2.0]);
  const exitM = Math.max(5, entry + pick([-1, 0, 0.5, 1, 2]));
  const EV0 = entry * E0, D = EV0 * debtPct / 100, Eq0 = EV0 - D;
  const EN = Math.round(E0 * factor), EVN = exitM * EN, EqN = EVN - D;
  const mom = EqN / Eq0, irr = (Math.pow(mom, 1 / 5) - 1) * 100;
  const num = s => parseFloat(String(s).replace(/[$,%x\s]/gi, ""));
  const grade = { eq: Math.abs(num(ans.eq) - Eq0) <= Math.max(1, Eq0 * 0.01), exit: Math.abs(num(ans.exit) - EqN) <= Math.max(1, EqN * 0.01), mom: Math.abs(num(ans.mom) - mom) <= 0.06, irr: Math.abs(num(ans.irr) - irr) <= 1.2 };
  const fields = [["eq", "Equity check ($M)", `${Eq0.toFixed(0)}`], ["exit", "Exit equity ($M)", `${EqN.toFixed(0)}`], ["mom", "Multiple of money (x)", `${mom.toFixed(2)}x`], ["irr", "5-yr IRR (%)", `${irr.toFixed(1)}%`]];
  const [scafMsg, setScafMsg] = useState("");
  const fresh = () => { setSeed(s => s + 1); setAns({ eq: "", exit: "", mom: "", irr: "" }); setChecked(false); setScafMsg(""); };
  // Intermediates (fi 0-2) fade with mastery; the four graded answers are NEVER shown ("ans").
  const STEPS = [
    [`Entry EV = ${entry.toFixed(1)}x × $${E0}M`, `= $${EV0.toFixed(0)}M`, 0],
    [`Debt = ${debtPct}% × entry EV`, `= $${D.toFixed(0)}M`, 1],
    [`Equity check = entry EV − debt`, "ans", -1],
    [`Exit EV = ${exitM.toFixed(1)}x × $${EN}M`, `= $${EVN.toFixed(0)}M`, 2],
    [`Exit equity = exit EV − debt`, "ans", -1],
    [`MoM = exit equity ÷ equity check; IRR ≈ MoM^(1/5) − 1`, null, -1],
  ];
  return <div>
    <p style={{ fontSize: 12.5, color: "#4a443c", lineHeight: 1.8, marginBottom: 14 }}>
      A sponsor buys a company generating <b>${E0}M of EBITDA</b> at <b>{entry.toFixed(1)}x</b>, financed with <b>{debtPct}% debt</b> (interest-only, no paydown). Over five years EBITDA grows to <b>${EN}M</b> and the sponsor exits at <b>{exitM.toFixed(1)}x</b>. Work it on paper:
    </p>
    {scaf.m < 4 ? <div style={{ border: "1px solid #e9ddc9", borderRadius: 8, background: "#f6eee1", padding: "8px 12px", marginBottom: 14 }}>
      <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Scaffold · level {scaf.m} of 4 · three clean solves fade a step · <span style={{ color: "#6f675c" }}>figures <span style={{ display: "inline-block", width: 22, height: 7, background: "#262421", borderRadius: 1, verticalAlign: "baseline" }} /> are set in ink — yours to work</span></div>
      {STEPS.map(([f, v, fi], i) => <div key={i} style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", color: "#6f675c", lineHeight: 1.9, display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
        <span>{i + 1}. {f}</span>
        {v && (v !== "ans" && fi < 3 - scaf.m
          ? <span style={{ color: "#33302c" }}>{v}</span>
          : <span style={{ display: "inline-block", width: 54, height: 9, background: "#262421", borderRadius: 1, alignSelf: "center" }} title={v === "ans" ? "One of the four answers below — always set in ink" : "Set in ink — work this figure yourself; it fades back in if you miss"} />)}
      </div>)}
    </div> : <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Scaffold retired — worked cold. A miss brings it back.</div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
      {fields.map(([k, label, sol]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: "#6f675c", width: 150, flexShrink: 0 }}>{label}</span>
        <input value={ans[k]} onChange={e => { setAns(p => ({ ...p, [k]: e.target.value })); setChecked(false); }} style={{ ...S.input, width: 92, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, padding: "6px 10px", textAlign: "right" }} />
        {checked && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: grade[k] ? "#0d6d56" : "#b2342b" }}>{grade[k] ? "✓" : `✗ ${sol}`}</span>}
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: checked ? 14 : 0 }}>
      <button onClick={() => { if (checked) return; setChecked(true); const allOk = Object.values(grade).every(Boolean); const prev = scaf; const next = bumpScaffold(allOk); setScafMsg(allOk ? (next.m > prev.m ? `Clean solve — the scaffold fades to level ${next.m} of 4.` : `Clean solve ${next.streak} of 3 — the scaffold fades at three.`) : (prev.m > 0 || prev.streak > 0 ? `A miss — the scaffold ${next.m < prev.m ? `returns to level ${next.m}` : "stays up"} and the count resets.` : "")); recordDrillResult({ src: "puzzle", qid: String(seed), ok: allOk, front: `Paper LBO: $${E0}M EBITDA at ${entry.toFixed(1)}x, ${debtPct}% debt, EBITDA to $${EN}M, exit ${exitM.toFixed(1)}x — equity check, exit equity, MoM, IRR?`, back: `Equity $${Eq0.toFixed(0)}M → $${EqN.toFixed(0)}M · ${mom.toFixed(2)}x MoM · ~${irr.toFixed(1)}% IRR`, given: `${ans.eq} / ${ans.exit} / ${ans.mom} / ${ans.irr}` }); }} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px" }}>Check</button>
      <button onClick={fresh} style={{ ...S.btn, fontSize: 10, letterSpacing: 1, padding: "7px 18px", color: "#6f675c", border: "1px solid #ddcfb8" }}>New problem</button>
    </div>
    {checked && scafMsg && <div style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, color: scafMsg.startsWith("Clean") ? "#0d6d56" : "#b0741e", marginBottom: 10 }}>{scafMsg.toUpperCase()}</div>}
    {checked && <div style={{ borderTop: "1px solid #e9ddc9", paddingTop: 12 }}>
      <div style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Worked solution</div>
      {[`Entry EV = ${entry.toFixed(1)}x × $${E0}M = $${EV0.toFixed(0)}M`,
        `Debt = ${debtPct}% × $${EV0.toFixed(0)}M = $${D.toFixed(0)}M → Equity check = $${Eq0.toFixed(0)}M`,
        `Exit EV = ${exitM.toFixed(1)}x × $${EN}M = $${EVN.toFixed(0)}M`,
        `Exit equity = $${EVN.toFixed(0)}M − $${D.toFixed(0)}M = $${EqN.toFixed(0)}M`,
        `MoM = ${EqN.toFixed(0)} ÷ ${Eq0.toFixed(0)} = ${mom.toFixed(2)}x → IRR = ${mom.toFixed(2)}^(1/5) − 1 ≈ ${irr.toFixed(1)}%`].map((s, i) => <div key={i} style={{ fontSize: 11, color: "#4a443c", fontFamily: "'JetBrains Mono',monospace", lineHeight: 2 }}>{i + 1}. {s}</div>)}
    </div>}
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 12, lineHeight: 1.6 }}>The classic PE interview warm-up — interest-only debt, no fees or taxes. Fresh numbers every time.</p>
  </div>;
}

// ============ MAIN ============
function SettingsPanel({ apiKey, setApiKey, finnhubKey, setFinnhubKey, desk, setDesk, open, onClose }) {
  const [input, setInput] = useState(apiKey || "");
  const [fhInput, setFhInput] = useState(finnhubKey || "");
  const [show, setShow] = useState(false);
  const save = () => { const k = input.trim(); const fk = fhInput.trim(); setApiKey(k); setFinnhubKey(fk); localStorage.setItem("mb_api_key", k); localStorage.setItem("mb_finnhub_key", fk); onClose(); };
  const clear = () => { setInput(""); setFhInput(""); setApiKey(""); setFinnhubKey(""); localStorage.removeItem("mb_api_key"); localStorage.removeItem("mb_finnhub_key"); };
  if (!open) return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(51,48,46,0.45)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.15s"}} onClick={onClose}>
    <div className="settings-modal" style={{background:"#fffdf9",border:"1px solid #d8c8b0",borderRadius:16,width:480,padding:28,boxShadow:"0 32px 80px rgba(64,52,32,0.14)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{color:"#33302c",fontSize:18,fontFamily:"'Instrument Serif',serif"}}>Settings</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#8a8072",fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:1.5,display:"block",marginBottom:6}}>Anthropic API Key</label>
        <div style={{display:"flex",gap:8}}>
          <input type={show?"text":"password"} value={input} onChange={e=>setInput(e.target.value)} placeholder="sk-ant-..." style={{flex:1,background:"#f6eee1",border:"1px solid #e9ddc9",borderRadius:8,padding:"10px 12px",color:"#33302c",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"}} />
          <button onClick={()=>setShow(!show)} style={{background:"#f6eee1",border:"1px solid #e9ddc9",borderRadius:8,padding:"8px 12px",color:"#8a8072",fontSize:11,cursor:"pointer"}}>{show?"Hide":"Show"}</button>
        </div>
        <p style={{fontSize:10,color:"#8a8072",marginTop:6}}>Powers AI briefings, news feed, market regime. Get a key at console.anthropic.com</p>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:1.5,display:"block",marginBottom:6}}>Finnhub API Key</label>
        <input type={show?"text":"password"} value={fhInput} onChange={e=>setFhInput(e.target.value)} placeholder="Finnhub API key..." style={{width:"100%",background:"#f6eee1",border:"1px solid #e9ddc9",borderRadius:8,padding:"10px 12px",color:"#33302c",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"}} />
        <p style={{fontSize:10,color:"#8a8072",marginTop:6}}>Powers real-time stock prices. Free at finnhub.io — sign up and copy your key.</p>
      </div>
      <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,borderTop:"1px solid #efe4d2",paddingTop:16}}>
        <div>
          <label style={{fontSize:10,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:1.5,display:"block",marginBottom:4}}>Desk Mode</label>
          <p style={{fontSize:10,color:"#8a8072",lineHeight:1.5}}>The editor's private study ledgers — review docket, errata, edition streak. Stored in this browser only.</p>
        </div>
        <button onClick={()=>setDesk(!desk)} style={{background:desk?"#0d6d5615":"#f6eee1",border:`1px solid ${desk?"#0d6d5630":"#e9ddc9"}`,borderRadius:8,padding:"8px 16px",color:desk?"#0d6d56":"#8a8072",fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:600,flexShrink:0}}>{desk?"ON":"OFF"}</button>
      </div>
      <p style={{fontSize:9,color:"#a2977f",marginBottom:16}}>Both keys stored locally in your browser only. Never committed to code.</p>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={clear} style={{background:"none",border:"1px solid #b2342b20",borderRadius:8,padding:"8px 16px",color:"#b2342b",fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>Clear All</button>
        <button onClick={save} style={{background:"#0d6d5615",border:"1px solid #0d6d5630",borderRadius:8,padding:"8px 20px",color:"#0d6d56",fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>Save</button>
      </div>
    </div>
  </div>;
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("mb_api_key") || "");
  const [finnhubKey, setFinnhubKey] = useState(() => localStorage.getItem("mb_finnhub_key") || "");
  const [desk, setDeskRaw] = useState(() => { try { return localStorage.getItem("mjb_desk") === "1"; } catch { return false; } });
  const setDesk = v => { setDeskRaw(v); try { localStorage.setItem("mjb_desk", v ? "1" : "0"); } catch {} };
  const [showSettings, setShowSettings] = useState(false);
  const { prices, live: pricesLive, asOf } = usePrices(TICKERS, finnhubKey);
  const hist = useHistory(TICKERS.map(t => t.symbol).join(","));
  const [tab, setTabRaw] = useState(() => { try { const valid = ["home", "projects", "markets", "news", "recruiter"]; const path = window.location.pathname.replace(/\/+$/, "").slice(1); if (valid.includes(path)) return path; const q = new URLSearchParams(window.location.search).get("tab"); return valid.includes(q) ? q : "home"; } catch { return "home"; } }), [hovP, setHovP] = useState(null), [cmd, setCmd] = useState(false), [showHero, setShowHero] = useState(() => { try { return !sessionStorage.getItem("mb_intro"); } catch { return true; } }), [mounted, setMounted] = useState(false);
  const setTab = (t) => { setTabRaw(t); try { window.history.pushState({ tab: t }, "", t === "home" ? "/" : `/${t}`); } catch {} window.scrollTo(0, 0); };
  const goAnchor = (t, id) => { setTabRaw(t); try { window.history.pushState({ tab: t }, "", `${t === "home" ? "/" : `/${t}`}#${id}`); } catch {} setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); else window.scrollTo(0, 0); }, 80); };
  useEffect(() => {
    const h = () => { try { const valid = ["home", "projects", "markets", "news", "recruiter"]; const path = window.location.pathname.replace(/\/+$/, "").slice(1); const q = new URLSearchParams(window.location.search).get("tab"); setTabRaw(valid.includes(path) ? path : valid.includes(q) ? q : "home"); } catch {} };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  useEffect(() => {
    const titles = { home: "Mason J. Bennett — M.S. Finance · Analyst Candidate", projects: "Projects & Deal Sheet — Mason J. Bennett", markets: "Markets — Mason J. Bennett", news: "News & Briefings — Mason J. Bennett", recruiter: "Recruiter Packet — Mason J. Bennett" };
    document.title = titles[tab] || titles.home;
  }, [tab]);
  useEffect(() => { if (!window.location.hash) return; const id = window.location.hash.slice(1); const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), showHero ? 3200 : 300); return () => clearTimeout(t); }, []);
  useEffect(() => { window.scrollTo(0, 0); if (!showHero) { setMounted(true); return; } try { sessionStorage.setItem("mb_intro", "1"); } catch {} const t = setTimeout(() => { setShowHero(false); setMounted(true); }, 2900); return () => clearTimeout(t); }, []);
  useEffect(() => { const h = e => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(true); } if (e.key === "Escape") setCmd(false); if (!e.metaKey && !e.ctrlKey && !e.altKey && ["1", "2", "3", "4"].includes(e.key) && !e.target.closest("input") && !e.target.closest("textarea")) setTab(["home", "projects", "markets", "news"][+e.key - 1]); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  const tabs = [{ id: "home", l: "Home" }, { id: "projects", l: "Projects" }, { id: "markets", l: "Markets" }, { id: "news", l: "News" }];

  return <div style={S.root}>
    {showHero && <Hero />}
    <Cmd open={cmd} onClose={() => setCmd(false)} onNav={t => setTab(t)} />
    <SettingsPanel apiKey={apiKey} setApiKey={setApiKey} finnhubKey={finnhubKey} setFinnhubKey={setFinnhubKey} desk={desk} setDesk={setDesk} open={showSettings} onClose={() => setShowSettings(false)} />
    <div className="bg-fx" style={{ position: "fixed", top: -200, right: -100, width: 900, height: 900, background: "radial-gradient(circle,rgba(13,109,86,0.045) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 8s ease-in-out infinite" }} />
    <div className="bg-fx" style={{ position: "fixed", bottom: -100, left: -100, width: 700, height: 700, background: "radial-gradient(circle,rgba(31,90,158,0.035) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 10s ease-in-out infinite", animationDelay: "2s" }} />
    <div className="bg-fx" style={{ position: "fixed", top: "30%", right: -100, width: 600, height: 600, background: "radial-gradient(circle,rgba(109,84,158,0.025) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 12s ease-in-out infinite", animationDelay: "4s" }} />
    <div className="bg-fx" style={{ position: "fixed", inset: 0, opacity: 0.045, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')", pointerEvents: "none" }} />

    <div className="status-bar" style={{ background: "#2b2825", padding: "7px 32px", display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "JetBrains Mono, monospace", color: "#cfc5b4", letterSpacing: 1, position: "relative", zIndex: 2 }}>
      <span>WALTON COLLEGE OF BUSINESS · UNIVERSITY OF ARKANSAS · DALLAS–FORT WORTH, TX</span>
      <span className="statusbar-quotes" style={{ display: "flex", gap: 18 }}>{pricesLive && ["SPY", "QQQ", "TLT", "GLD"].map(sym => { const t = prices.find(p => p.symbol === sym); if (!t || t.price === "—") return null; const up = parseFloat(t.change) >= 0; return <span key={sym} style={{ display: "inline-flex", gap: 6 }}><span style={{ color: "#7d7568" }}>{sym}</span><span style={{ color: "#cfc5b4" }}>{t.price}</span><span style={{ color: up ? "#3ecf8e" : "#e07a70" }}>{up ? "+" : "−"}{Math.abs(parseFloat(t.change)).toFixed(2)}%</span></span>; })}<CreditStrip /></span>
      <span><span style={{ color: "#3ecf8e" }}>●</span> OPEN TO OPPORTUNITIES · IB / PE / WEALTH MANAGEMENT / CORPORATE FINANCE</span>
    </div>

    <div className="masthead" style={{ background: "rgba(250,244,235,0.95)", padding: "20px 32px 16px", position: "relative", zIndex: 90 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1300, margin: "0 auto", gap: 16 }}>
        <div className="masthead-side" style={{ flex: "1 1 0", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 1.5, textTransform: "uppercase" }}>{(() => { const d = new Date(), day = d.getDay(), mins = d.getHours() * 60 + d.getMinutes(); const ed = (day === 0 || day === 6) ? "Weekend Edition" : mins < 570 ? "Morning Edition" : mins < 960 ? "Midday Edition" : "Evening Edition"; return `${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} — ${ed}`; })()}</div>
        <div style={{ textAlign: "center" }}>
          <div className="masthead-name" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: "#262421", letterSpacing: "-0.015em", lineHeight: 1 }}>Mason J. Bennett</div>
          <div className="masthead-tag" style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase", marginTop: 7 }}>Investment Banking · Private Equity · Wealth Management · Corporate Finance</div>
        </div>
        <div className="masthead-side" style={{ flex: "1 1 0", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}><MktBadge />{pricesLive && <WeatherEar prices={prices} />}</div>
      </div>
    </div>

    <header style={S.header}>
      <div className="mjb-mark" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: "#262421", minWidth: 44 }}>MJB</div>
      <nav style={{ display: "flex", gap: 2, background: "rgba(255,253,249,0.85)", borderRadius: 10, padding: 4, border: "1px solid #e3d5bf", boxShadow: "inset 0 2px 6px rgba(64,52,32,0.07)" }}>
        {tabs.map((t, i) => <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabA : {}) }}><span style={{ fontSize: 8, opacity: 0.3, marginRight: 4 }}>{i + 1}</span>{t.l}</button>)}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ ...S.btn, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 10, padding: "5px 12px" }} title="Download Resume">Resume</a>
        <button onClick={() => setShowSettings(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: apiKey ? "#0d6d5608" : "rgba(255,253,249,0.85)", border: `1px solid ${apiKey ? "#0d6d5620" : "#e9ddc9"}`, borderRadius: 8, padding: "5px 10px", color: apiKey ? "#0d6d56" : "#8a8072", fontSize: 10, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }} title={apiKey ? "API Connected" : "Settings"}>{apiKey ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: 3, background: "#0d6d56" }} />API</span> : <GearIc />}</button>
        <button onClick={() => setCmd(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 8, padding: "5px 10px", color: "#8a8072", fontSize: 10, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>⌘K</button>
        {LINKS.slice(0, 2).map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8072", textDecoration: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1px solid #e9ddc9", transition: "all 0.25s" }}><span style={{ fontSize: 9, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{l.ic}</span></a>)}
      </div>
      <ScrollRule />
    </header>

    <div className="tape" style={{ overflow: "hidden", borderBottom: "1px solid #e9ddc930", background: "rgba(253,248,240,0.92)", padding: "7px 0", position: "relative", maskImage: "linear-gradient(90deg, transparent, black 60px, black calc(100% - 60px), transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 60px, black calc(100% - 60px), transparent)" }}><div style={{ display: "flex", gap: 0, animation: "scroll 55s linear infinite", width: "max-content", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{[...prices, ...prices].map((t, i) => <a key={i} href={`https://www.tradingview.com/symbols/${t.symbol}/`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 8, whiteSpace: "nowrap", paddingRight: 18, marginRight: 18, borderRight: "1px solid #e9ddc930", textDecoration: "none", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}><span style={{ color: "#8a8072", fontWeight: 600 }}>{t.symbol}</span><span style={{ color: "#6f675c" }}>${t.price}</span><span style={{ color: parseFloat(t.change) >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{parseFloat(t.change) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(t.change)).toFixed(2)}%</span></a>)}</div></div>

    <main style={{ padding: 32, maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: "all 0.6s ease 0.3s" }}>

      {tab === "markets" && <div>
        <Kicker n="03" t="Markets & Data" />
        <MacroTape />
        <CrossAssetRows />
        <QuoteLookup />
        {desk && <EditionStrip />}
        {desk && <TodaysDesk />}
        {desk && <FirstCall prices={prices} live={pricesLive} apiKey={apiKey} />}
        {desk && <LateEdition prices={prices} live={pricesLive} />}
        {desk && <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> The Review Docket<Info text="Spaced repetition over everything you've missed on this site. Cards are scheduled with the SM-2 algorithm: misses return tomorrow, solid answers push the next review further out. Private — lives in this browser's storage only." /></h2>
            <ReviewDocket />
          </section>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.06s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Errata & Corrections<Info text="Every missed question is filed as a correction, newspaper-style, with room for a one-line rule so the same mistake isn't made twice. Private to this browser." /></h2>
            <ErrataColumn />
          </section>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.1s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#b3551d" }}>◆</span> Notices & Alerts<Info text="File a rule — a price cross or a daily-move threshold — and the page opens with a NOTICES box when it fires, persisting until you mark it read. Checked on load against the live tape; no push infrastructure, no server. Private to this browser." /></h2>
            <Notices prices={prices} live={pricesLive} />
          </section>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.14s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Bennett vs. the Tape<Info text="Three calls filed before the 4pm bell — SPY's direction, QQQ-vs-IWM leadership, and the 10-year — graded automatically against the closing tape and the Treasury's own data. The running calibration table is the point: having a view and being scored on it. Private to this browser." /></h2>
            <BennettVsTape prices={prices} live={pricesLive} />
          </section>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.18s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> The Syllabus Ledger<Info text="Six units of the interview syllabus, graded from your own attempt log with a 30-day decay — states in agate text, never progress bars. The weakest unit sets a daily assignment question. Derived entirely from marks already in this browser." /></h2>
            <SyllabusLedger />
          </section>
        </div>}
        <div style={{ ...S.card, marginBottom: 18, animation: "fadeUp 0.5s ease both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Question of the Day<Info text="One technical interview question per day from the house bank — same edition for every reader, like a crossword. Reveal the answer, then grade yourself honestly. Grades never leave your browser." /></h2>
          <QOTD />
        </div>
        <div style={{ ...S.card, marginBottom: 18, animation: "fadeUp 0.5s ease 0.05s both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> The Daily Drill<Info text="One dated edition per day: six stations mixed across every drill generator on the site — technicals at rising difficulty, a tape-signal check, a three-statement ripple, and the paper LBO. Interleaving is deliberate: identifying WHICH method applies is the skill interviews test. Same edition for every reader; marks stay in your browser." /></h2>
          <DailyDrill onGoPuzzle={() => goAnchor("projects", "puzzle-corner")} />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section id="lexicon" style={{ ...S.card, animation: "fadeUp 0.5s ease both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> The Lexicon<Info text="One term a day from the 300-entry house dictionary — accounting to Street slang, definitions written in-house. Flip on 'quiz me first' to hide the definition and grade your recall; marks feed the Review Docket and never leave your browser." /></h2>
            <LexiconBox desk={desk} />
          </section>
          <section id="bias-ledger" style={{ ...S.card, animation: "fadeUp 0.5s ease 0.05s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> The Bias Ledger<Info text="One behavioral-finance bias a day from the 40-entry almanac: what it is, the tell in a real book, and the working countermeasure. With the desk on, it cross-prints against your paper positions — read locally, never sent anywhere." /></h2>
            <BiasLedger desk={desk} />
          </section>
        </div>
        <div id="explain-desk" style={{ ...S.card, marginBottom: 18, animation: "fadeUp 0.5s ease both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Explain It to the Desk<Info text="The Feynman drill: one concept a day, explained in plain sentences. With an Anthropic key set, Claude plays the sharp novice who just joined the desk and returns the one gap in your explanation plus the follow-up question it invites. Your writing never leaves this browser except to Anthropic with your own key." /></h2>
          <ExplainDesk apiKey={apiKey} />
        </div>
        <div style={{ marginBottom: 24, animation: "fadeUp 0.5s ease both", padding: "20px 24px", background: "linear-gradient(135deg, rgba(255,253,249,0.9), rgba(251,245,236,0.7))", borderRadius: 10, border: "1px solid #e3d5bf", boxShadow: "0 4px 20px rgba(64,52,32,0.07)" }}><Clock /></div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.08s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Watchlist<Info text="Live market prices grouped by signal: indices (SPY, QQQ, IWM), mega-cap movers (NVDA, AAPL, MSFT, JPM, TSLA), and macro indicators (TLT for rates, GLD for risk-off, UUP for dollar). Click any ticker for TradingView. Source: Finnhub.io" />{apiKey && <Info text={"Signal cheat sheet: TLT drops + SPY flat \u2192 rates rising, deal flow slows. GLD + TLT both spike \u2192 risk-off, market scared. IWM diverges from SPY \u2192 small-cap sentiment shifting (PE pipeline signal). QQQ outpaces SPY \u2192 growth/tech rotation. JPM moves on earnings \u2192 read-through on credit conditions and IB deal activity. UUP rising \u2192 dollar strengthening, pressure on international deals and EM. NVDA guidance \u2192 AI capex cycle indicator, affects entire tech sector. TLT rising + SPY rising \u2192 goldilocks (rates falling, equities up)."} linkLabel="TradingView" link="https://www.tradingview.com" />}{!pricesLive && <span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>DEMO DATA</span>}</h2>
            <p style={{ fontSize: 11, color: "#8a8072", fontStyle: "italic", margin: "-6px 0 10px" }}>The names I track daily.</p>
            {prices.every(p => p.price === "—") && <div style={{ fontSize: 10, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, padding: "8px 0" }}>AWAITING WIRE <span style={{ animation: "blink 1s step-end infinite", color: "#0d6d56" }}>▮</span></div>}
            {prices.map(t => <a key={t.symbol} href={`https://www.tradingview.com/symbols/${t.symbol}/`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 10, transition: "all 0.2s", cursor: "pointer", borderLeft: "2px solid transparent", textDecoration: "none" }} onMouseEnter={e => {e.currentTarget.style.background = "rgba(13,109,86,0.04)"; e.currentTarget.style.borderLeftColor = "#0d6d5650";}} onMouseLeave={e => {e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent";}}>
              <div><span style={{ color: "#33302c", fontWeight: 600, fontSize: 13 }}>{t.symbol}</span><span style={{ color: "#8a8072", fontSize: 11, marginLeft: 8 }}>{t.name}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{hist && hist[t.symbol] && hist[t.symbol].closes ? <Sparkline closes={hist[t.symbol].closes} hi52={hist[t.symbol].hi52} lo52={hist[t.symbol].lo52} /> : <RangeBar h={t.h} l={t.l} c={parseFloat(t.price)} />}<span style={{ color: "#33302c", fontFamily: "JetBrains Mono, monospace", fontSize: 13, minWidth: 60, textAlign: "right" }}>${t.price}</span><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, minWidth: 58, textAlign: "right", color: parseFloat(t.change) >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{parseFloat(t.change) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(t.change)).toFixed(2)}%</span></div>
            </a>)}
            <SourceLine>Source: Finnhub · 5-min cache{asOf ? ` · as of ${asOf}` : ""}{hist ? " · 1-yr trend via Yahoo Finance" : ""}{pricesLive ? "" : " · simulated demo data"}</SourceLine>
          </section>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.12s both" }}>
              <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Quick Links<Info text="One-click access to essential finance platforms — Bloomberg, Reuters, EDGAR, TradingView, and more." /></h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{QLINKS.map(s => <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer" style={{...S.chip, boxShadow: "0 2px 6px rgba(64,52,32,0.05)"}} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5640"; e.currentTarget.style.color = "#0d6d56"; e.currentTarget.style.background = "rgba(13,109,86,0.06)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(13,109,86,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e9ddc9"; e.currentTarget.style.color = "#6f675c"; e.currentTarget.style.background = "rgba(255,253,249,0.85)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(64,52,32,0.05)"; e.currentTarget.style.transform = "none"; }}>{s.n}</a>)}</div>
            </section>
            <div style={{ animation: "fadeUp 0.5s ease 0.16s both" }}><MarketDiary prices={prices} live={pricesLive} /></div>
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.2s both" }}><h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Sector Heatmap<Info text="Visual map of sector performance by GICS sector. Size reflects relative market cap weight. Green = positive, red = negative, yellow = flat. Click any ticker to open TradingView. Source: Finnhub.io real-time quotes (5-min cache)." link="https://www.investopedia.com/terms/s/sector-analysis.asp" linkLabel="Sector rotation & analysis" />{!pricesLive && <span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>DEMO DATA</span>}</h2><HeatMap finnhubKey={finnhubKey} /><SourceLine>Source: Finnhub · cells sized by market-cap weight · 5-min cache</SourceLine></section>
          <RegimeIndicator apiKey={apiKey} />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <EarningsCal apiKey={apiKey} />
          <EconCalendar apiKey={apiKey} />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.44s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> The Rates Page<Info text="Today's full Treasury par yield curve drawn against one month and one year ago, straight from the Treasury's daily data. The 2s10s dateline tracks how long the curve has held its shape — the single highest-signal fixed-income read of the morning." link="https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics" linkLabel="Treasury interest-rate statistics" /></h2>
            <RatesPlate />
          </section>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.48s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Macro Ledger<Info text="The prints every interview and morning meeting references — CPI, unemployment, Fed funds, the 10-year, the 30-year mortgage — each with its change from the prior reading and release dateline. The econ calendar says CPI is due; this shows the print." link="https://fred.stlouisfed.org" linkLabel="FRED" /></h2>
            <MacroLedger />
          </section>
        </div>
        <div id="drawdown-meter" style={{ ...S.card, marginBottom: 18, animation: "fadeUp 0.5s ease 0.52s both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#b2342b" }}>◆</span> The Drawdown Meter<Info text="A one-glance risk read from FRED: how far the S&P 500 has fallen from its highest close in the lookback window, how many sessions it has spent below that peak, and where today's VIX ranks against its own recent range. Drawdown and days-underwater use daily S&P 500 closes; the VIX figure is a percentile over the same window." link="https://fred.stlouisfed.org/series/SP500" linkLabel="FRED · S&P 500 series" /></h2>
          <DrawdownMeter />
        </div>
        {desk ? <div style={{ ...S.card, animation: "fadeUp 0.5s ease 0.4s both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Positions Ledger — The Paper Book<Info text="A paper-trading book marked to the live tape. Fills execute at the last trade when you click; every buy demands a one-line thesis, printed beside the position so your past reasoning confronts your P&L. Reset archives the old book rather than deleting it. Private to this browser." /></h2>
          <PositionsLedger />
        </div> : <div style={{ ...S.card, animation: "fadeUp 0.5s ease 0.4s both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Portfolio Allocation<Info text="Sample asset allocation by weight — illustrative, not investment advice. Hover the donut to see individual holdings." link="https://www.investopedia.com/terms/a/assetallocation.asp" linkLabel="Asset allocation basics" /><span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>SAMPLE</span></h2>
          <div className="portfolio-layout" style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}><Donut data={PORTFOLIO} size={200} /><div style={{ flex: 1, minWidth: 300 }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Ticker", "Name", "Type", "Weight"].map(h => <th key={h} style={{ textAlign: h === "Weight" ? "right" : "left", padding: "10px 12px", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", borderBottom: "1px solid #e9ddc9" }}>{h}</th>)}</tr></thead><tbody>{PORTFOLIO.map(p => <tr key={p.ticker} style={{ borderBottom: "1px solid #e9ddc910" }} onMouseEnter={e => e.currentTarget.style.background = "#e9ddc910"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><td style={{ padding: "12px", fontSize: 13, color: "#0d6d56", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{p.ticker}</td><td style={{ padding: "12px", fontSize: 13, color: "#6f675c" }}>{p.name}</td><td style={{ padding: "12px" }}><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: p.type === "ETF" ? "#1f5a9e10" : p.type === "Crypto" ? "#b0741e10" : "#0d6d5610", color: p.type === "ETF" ? "#1f5a9e" : p.type === "Crypto" ? "#b0741e" : "#0d6d56" }}>{p.type}</span></td><td style={{ padding: "12px", fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#6f675c" }}><div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}><div style={{ width: 80, height: 4, background: "#f6eee1", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${p.weight * 3.3}%`, height: "100%", background: "linear-gradient(90deg,#0d6d56,#1f5a9e)", borderRadius: 2 }} /></div>{p.weight}%</div></td></tr>)}</tbody></table></div></div>
        </div>}
      </div>}

      {tab === "news" && <div style={{ animation: "fadeUp 0.4s ease both" }}><Kicker n="04" t="News & Briefings" />
        <div id="standing-wire" style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> The Standing Wire<Info text="An always-on headline wire from official feeds — Reuters, WSJ, CNBC, MarketWatch, Yahoo Finance. Front Page groups the same story across outlets into one line, Techmeme-style; The River is the raw chronological tape. Every headline links to the publisher. No key required." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="news" id="standing-wire" /></span></h2>
          <StandingWire desk={desk} />
        </div>
        <Briefings apiKey={apiKey} />
        <div id="filings-wire" style={{ ...S.card, marginTop: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Filings Wire<Info text="Material corporate events straight from the primary source: 8-K material-event reports, SC 13D activist stakes, and S-1 IPO registrations, live from SEC EDGAR's current-filings feed. Public-domain data; every line links to the filing itself on sec.gov." link="https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent" linkLabel="EDGAR latest filings" /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="news" id="filings-wire" /></span></h2>
          <FilingsWire />
        </div>
        <div id="reading-ledger" style={{ ...S.card, marginTop: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> The Reading Ledger<Info text="The serious-reading rack: latest issue titles from Net Interest, Klement on Investing, The Transcript, and Apricitas Economics via their public feeds. Titles link to the publication; racks that go dormant hide themselves." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="news" id="reading-ledger" /></span></h2>
          <ReadingLedger />
        </div>
        {desk && <CirculationAudit />}
      </div>}

      {tab === "projects" && <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <Kicker n="02" t="Selected Work" />
        <h1 style={S.pageTitle}>Projects</h1><p style={{ color: "#6f675c", marginBottom: 32, fontSize: 14 }}>Graduate coursework and independent builds — financial modeling, econometrics, and quantitative analysis.</p>
        <div style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#33302c" }}>◆</span> Deal Sheet<span style={{ marginLeft: "auto", fontSize: 8, color: "#a2977f", letterSpacing: 1 }}>STUDENT RECONSTRUCTIONS OF REAL TRANSACTIONS</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(230px,100%),1fr))", gap: 14 }}>
            {DEALS.map(d => <div key={d.co} id={d.id} className="tombstone" style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -5, borderRadius: 2, padding: "30px 18px 20px", textAlign: "center", background: "#fffdf9", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 30, fontFamily: "'Instrument Serif',serif", color: "#262421", lineHeight: 1 }}>{d.value}</div>
              <div style={{ fontSize: 8, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, marginTop: 8 }}>{d.type}</div>
              <div style={{ width: 36, borderTop: "1px solid #0d6d56", margin: "14px auto" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#33302c" }}>{d.co}</div>
              <div style={{ fontSize: 10, color: "#6f675c", marginTop: 3 }}>{d.sub}</div>
              <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "'JetBrains Mono',monospace", marginTop: 12, lineHeight: 1.6 }}>{d.detail}</div>
              <div style={{ fontSize: 8, color: "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginTop: 12, textTransform: "uppercase" }}>{d.date} · Student Reconstruction</div>
              <div style={{ borderTop: "1px solid #e9ddc9", marginTop: 16, paddingTop: 12, textAlign: "left", flex: 1 }}>
                {[["Thesis", d.thesis], ["Assumptions", d.assumptions], ["Takeaway", d.takeaway]].map(([l, t]) => <div key={l} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>{l} — </span>
                  <span style={{ fontSize: 11, color: "#4a443c", lineHeight: 1.6 }}>{t}</span>
                </div>)}
              </div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "flex", gap: 12 }}>
                  {d.model && <a href={d.model} download style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>↧ Model (.xlsx)</a>}
                  {d.memo && <a href={d.memo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>Memo (PDF)</a>}
                  {d.deck && <a href={d.deck} download style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>↧ IC Deck (.pptx)</a>}
                </span>
                <CopyAnchor tab="projects" id={d.id} />
              </div>
            </div>)}
          </div>
        </div>
        <div id="hca-field" style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> HCA Healthcare — Valuation Football Field<Info text="The classic banker valuation summary, hand-built in React from the GFI pitch: each bar is one valuation method's range from the team's sensitivity tables, with the price target, the price on pitch day, and today's live price drawn as vertical rules." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="hca-field" /></span></h2>
          <FootballField />
        </div>
        <div id="lbo-sandbox" style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Interactive — Mini LBO Model<Info text="A simplified leveraged-buyout model you can play with. Set the entry price, leverage, growth, and exit assumptions — the sponsor returns and value-creation bridge update live. Built in React to demonstrate the mechanics behind the deal reconstructions above." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="lbo-sandbox" /></span></h2>
          <LBOSandbox />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <div id="merger-math" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Interactive — Merger Math<Info text="Accretion/dilution — the other classic IB interview mechanic. Two hypothetical companies: set the premium, consideration mix, cost of debt, and synergies, and pro-forma EPS updates live." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="merger-math" /></span></h2>
            <MergerMath />
          </div>
          <div id="puzzle-corner" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Puzzle Corner — The Paper LBO<Info text="The classic private equity interview warm-up, generated fresh every time. Work it on paper, enter your answers, and check against the full worked solution." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="puzzle-corner" /></span></h2>
            <PuzzleCorner />
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <div id="ripple-drill" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Drill — The Three-Statement Ripple<Info text="The most-asked technical question in IB interviews: perturb one line item and trace it through the income statement, cash flow statement, and balance sheet. Seeded generator, ten scenario types, checked cell by cell against the worked ripple." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="ripple-drill" /></span></h2>
            <ThreeStatementRipple />
          </div>
          <div id="technicals-desk" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> The Technicals Desk<Info text="A house bank of original interview technical questions across the eight canonical categories. Browse by category, reveal the answer set in ink, and grade yourself. Grades stay in your browser." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="technicals-desk" /></span></h2>
            <TechnicalsDesk />
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <div id="debt-ledger" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Drill — The Debt Ledger<Info text="The hard-mode drill between paper LBOs and real models: a seeded term loan with mandatory amortization and a cash sweep. Work the three-year waterfall on paper — interest, amort, sweep, in that order — and check the ending balances and exit leverage against the worked schedule." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="debt-ledger" /></span></h2>
            <DebtLedger />
          </div>
          <div id="coupon-desk" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b3551d" }}>◆</span> Drill — The Coupon Desk<Info text="Bond arithmetic drilled as mental math: current yield, the duration approximation for a rate shock, and the new price — plus the premium/discount yield ordering that interviews love. Seeded fresh daily." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="coupon-desk" /></span></h2>
            <CouponDesk />
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <div id="waterfall-room" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Drill — The Waterfall Room<Info text="The distressed-debt staple: an emergence enterprise value falls through a seeded capital structure by absolute priority. Work the recoveries in cents on the dollar and name the fulcrum security — the class whose shortfall converts to post-reorg equity. Fresh structure daily." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="waterfall-room" /></span></h2>
            <WaterfallRoom />
          </div>
          <div id="two-minute-tape" style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Drill — The Two-Minute Tape<Info text="Timed mental math with a finance-native problem set: percentage moves, EV from EBITDA and a multiple, earnings yields, the rule of 72, basis points on a facility. Auto-submits the instant the answer is right, Zetamac-style. The day's first run is the same tape for every reader; scores stay in your browser." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="two-minute-tape" /></span></h2>
            <TwoMinuteTape />
          </div>
        </div>
        <div id="redline" style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Drill — Redline the Exhibit<Info text="The inverted drill: a completed exhibit contains exactly one planted error, propagated consistently so it must be caught on principle rather than arithmetic. Click the flawed line, submit the redline, and the correction prints in proofreader's red ink. Model review is the actual analyst job — nothing else drills it." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="redline" /></span></h2>
          <RedlineExhibit />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(360px,100%),1fr))", gap: 14 }}>{PROJECTS.map((p, i) => <div key={i} style={{ ...S.pCard, ...(hovP === i ? { border: "1px solid #0d6d5650", transform: "translateY(-6px) scale(1.01)", boxShadow: "0 20px 50px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.15), 0 0 40px rgba(13,109,86,0.05)" } : {}), animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s` }} onMouseEnter={() => setHovP(i)} onMouseLeave={() => setHovP(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>PROJECT_{String(i + 1).padStart(2, "0")}{p.completed && <span style={{ marginLeft: 8, color: "#a2977f" }}>· {p.completed}</span>}</span><div style={{ display: "flex", alignItems: "center", gap: 6 }}>{p.updated && <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "JetBrains Mono, monospace" }}>Updated {p.updated}</span>}<span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: p.status === "In Progress" ? "#b0741e08" : "#0d6d5608", color: p.status === "In Progress" ? "#b0741e" : "#0d6d56", fontFamily: "JetBrains Mono, monospace" }}>{p.status}</span></div></div>
          {p.img && <img src={p.img} alt={p.title} loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", objectPosition: "top", borderRadius: 10, border: "1px solid #e9ddc9", marginBottom: 14, display: "block", background: "#f6eee1" }} />}
          <h3 style={{ color: "#33302c", fontSize: 17, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
          <p style={{ color: "#6f675c", fontSize: 13, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{p.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: p.url ? 12 : 0 }}>{p.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: "#e9ddc930", color: "#6f675c", fontFamily: "JetBrains Mono, monospace" }}>{t}</span>)}</div>
          {(p.url || p.demo) && <div style={{ display: "flex", gap: 12 }}>
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#1f5a9e", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 10px", background: "#1f5a9e08", border: "1px solid #1f5a9e20", borderRadius: 6, transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#1f5a9e15";e.currentTarget.style.borderColor="#1f5a9e40"}} onMouseLeave={e=>{e.currentTarget.style.background="#1f5a9e08";e.currentTarget.style.borderColor="#1f5a9e20"}}>▶ Live Demo <span style={{fontSize:9}}>↗</span></a>}
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#0d6d56", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 0", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{p.url.includes("github") ? "GitHub" : p.url.includes("report") ? "Read the Report" : p.url.includes("paper") ? "View Paper" : "View"} <span style={{fontSize:9}}>↗</span></a>}
          </div>}
        </div>)}</div>
      </div>}

      {tab === "home" && <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 860, margin: "0 auto" }}>
        <Kicker n="01" t="Profile" />
        <div style={{ background: "linear-gradient(135deg, rgba(13,109,86,0.5), rgba(224,209,186,0.9), rgba(31,90,158,0.35))", borderRadius: 11, padding: 1, boxShadow: "0 12px 48px rgba(13,109,86,0.08)" }}>
        <div style={{ ...S.card, background: "linear-gradient(135deg,#f6eee1,#fdf8f0,#f6eee1)", border: "none", borderRadius: 10, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(circle,rgba(13,109,86,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, background: "radial-gradient(circle,rgba(31,90,158,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div className="bio-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
            <div style={{ flexShrink: 0, borderRadius: 10, padding: 6, border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -4, background: "#fffdf9", boxShadow: "0 12px 40px rgba(64,52,32,0.12)" }}>
              <img src="/headshot.jpg" alt="Mason J. Bennett" className="bio-headshot" style={{ width: 176, height: 176, borderRadius: 5, objectFit: "cover", objectPosition: "center 15%", filter: "grayscale(0.18) sepia(0.1) contrast(1.05) brightness(1.01)", display: "block" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: "#33302c", fontSize: 30, fontFamily: "Instrument Serif, serif", marginBottom: 4, textShadow: "0 2px 16px rgba(0,0,0,0)" }}>Mason J. Bennett</h2>
              <p style={{ color: "#0d6d56", fontSize: 12, fontFamily: "JetBrains Mono, monospace", marginBottom: 16 }}>M.S. Finance · University of Arkansas · Dallas–Fort Worth, TX</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, borderTop: "1px solid #e9ddc9", borderBottom: "1px solid #e9ddc9", padding: "12px 0" }}>
                {["M.S. Finance, 4.0 GPA — Walton College of Business, May 2026",
                  "Info Tech Sector Analyst — Shollmier Investment Fund, a $700K+ student-managed portfolio (Spring 2026)",
                  "Seeking analyst roles: IB · PE · Wealth Management · Corporate Finance — Dallas–Fort Worth"].map(l => <div key={l} style={{ fontSize: 13.5, color: "#33302c", fontWeight: 600, lineHeight: 1.45 }}>{l}</div>)}
              </div>
              <p style={{ color: "#4a443c", fontSize: 13.5, lineHeight: 1.8, marginBottom: 18 }}>Led graduate student deal teams reconstructing two real transactions — a $55B take-private LBO and a £900M sponsor-to-sponsor buyout — as fully modeled hypothetical acquisitions built from public filings. Bloomberg Market Concepts certified; FINRA SIE in progress.</p>
              <div className="bio-badges" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Investment Banking", "Private Equity", "Wealth Management", "Corporate Finance"].map(t => <span key={t} style={{ fontSize: 10, padding: "5px 14px", borderRadius: 20, background: "linear-gradient(135deg, rgba(13,109,86,0.1), rgba(31,90,158,0.06))", color: "#0d6d56", border: "1px solid rgba(13,109,86,0.2)", fontFamily: "JetBrains Mono, monospace", boxShadow: "0 2px 8px rgba(13,109,86,0.06)" }}>{t}</span>)}</div>
              <div className="bio-badges" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 22px", borderRadius: 10, background: "#0d6d56", color: "#fdf8f0", fontSize: 12, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(13,109,86,0.25)", transition: "all 0.25s" }} onMouseEnter={e => e.currentTarget.style.background = "#0a5a47"} onMouseLeave={e => e.currentTarget.style.background = "#0d6d56"}>Download Resume</a>
                <a href="https://linkedin.com/in/bennettmason" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 22px", borderRadius: 10, background: "#fffdf9", color: "#33302c", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid #d8c8b0", transition: "all 0.25s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.borderColor = "#d8c8b0"}>LinkedIn</a>
                <CopyEmail style={{ padding: "10px 22px", borderRadius: 10, background: "#fffdf9", color: "#33302c", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid #d8c8b0", transition: "all 0.25s", fontFamily: "'JetBrains Mono',monospace" }} />
              </div>
            </div>
          </div>
        </div>
        </div>
        <div style={{ padding: "24px 4px 8px", maxWidth: 620, margin: "0 auto" }}>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: "#4a443c" }}>
            <span style={{ float: "left", fontFamily: "'Instrument Serif',serif", fontSize: 50, lineHeight: 0.82, color: "#0d6d56", paddingRight: 9, paddingTop: 5 }}>W</span>
            elcome. This site is part resume, part working tool — a small financial newspaper I built, edit, and use every day: live market prices, deal reconstructions with the models attached, and the occasional experiment. If you're a recruiter, the Work Index below collects everything in one list. If you're friends or family — this is what I do all day, on one page. The presses run continuously.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 20, color: "#262421" }}>— Mason</span>
            <span style={{ color: "#0d6d56", fontSize: 10 }}>∎</span>
          </div>
        </div>
        <div className="about-stats" style={{ ...S.card, margin: "14px 0", display: "flex", justifyContent: "space-around", padding: "20px 32px", flexWrap: "wrap", gap: 16 }}>
          {[["Master's GPA", "4.0", "Walton College"], ["Undergrad GPA", "3.62", "Dean's List ×5"], ["Self-Funded", "100%", "of undergrad education"], ["Graduated", "May 2026", "M.S. Finance"]].map(([label, val, sub], i) => (
            <div key={label} style={{ textAlign: "center", padding: "20px 24px", borderRadius: 14, background: "linear-gradient(145deg, #f6eee1, #f6eee1)", border: "1px solid #e3d5bf", flex: "1 1 0", minWidth: 120, boxShadow: "inset 0 2px 10px rgba(64,52,32,0.07), 0 1px 0 rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "#33302c", marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6f675c", fontWeight: 500, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace" }}>{sub}</div>
            </div>
          ))}
        </div>
        <Reveal><div style={{ padding: "8px 0 22px" }}>
          <Slug right={<button onClick={() => setTab("projects")} style={{ ...S.btn, fontSize: 10, padding: "5px 14px" }}>All projects →</button>}>Featured Work</Slug>
          <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FEATURED.map(p => <div key={p.title} style={{ borderRadius: 12, border: "1px solid #e9ddc9", overflow: "hidden", background: "#fffdf9", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer" }} onClick={() => p.id ? goAnchor(p.tab, p.id) : setTab(p.tab)} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,109,86,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <img src={p.img} alt={p.title} loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", objectPosition: "top", display: "block", borderBottom: "1px solid #e9ddc9", background: "#f6eee1" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ color: "#33302c", fontSize: 14, fontWeight: 600 }}>{p.title}</span>
                  {p.note && <span style={{ fontSize: 8, color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, textTransform: "uppercase" }}>{p.note}</span>}
                </div>
                <div style={{ color: "#6f675c", fontSize: 11, lineHeight: 1.5 }}>{p.blurb}</div>
              </div>
            </div>)}
          </div>
        </div>
        </Reveal>
        <Reveal><div style={{ padding: "8px 0 22px" }}>
          <Slug icon="#b0741e" right={<span style={{ fontSize: 8, color: "#a2977f", letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace" }}>UPDATED JUL 2026</span>}>Now</Slug>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {["Interviewing for analyst roles across investment banking, private equity, wealth management, and corporate finance",
              "Extending the EA / Jagex LBO framework to new hypothetical buyout targets",
              "Preparing for the FINRA SIE — CFA Level I planned next",
              "Reading Damodaran on Valuation and Pignataro's Financial Modeling & Valuation"].map((t, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span style={{ color: "#0d6d56", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>→</span><span style={{ color: "#4a443c", fontSize: 13, lineHeight: 1.6 }}>{t}</span></div>)}
          </div>
        </div>
        </Reveal>
        <Reveal><div style={{ padding: "8px 0 22px" }}>
          <Slug icon="#1f5a9e">Timeline</Slug>
          <div style={{ position: "relative", paddingLeft: 22 }}><div style={{ position: "absolute", left: 5, top: 5, bottom: 5, width: 2, background: "linear-gradient(180deg,#0d6d56,#1f5a9e,#e9ddc9)", borderRadius: 1 }} />
            {EXPERIENCE.map((e, i) => <div key={i} style={{ position: "relative", marginBottom: i < EXPERIENCE.length - 1 ? 18 : 0 }}>
              <div style={{ position: "absolute", left: -19, top: 4, width: 9, height: 9, borderRadius: 5, background: e.type === "edu" ? "#0d6d56" : "#1f5a9e", border: "2px solid #f6eee1" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}><h3 style={{ color: "#33302c", fontSize: 13, fontWeight: 600 }}>{e.role}</h3><span style={{ color: "#8a8072", fontSize: 9, fontFamily: "JetBrains Mono, monospace", flexShrink: 0, marginLeft: 8 }}>{e.date}</span></div>
              <p style={{ color: e.type === "edu" ? "#0d6d56" : "#1f5a9e", fontSize: 10, marginBottom: 3, fontFamily: "JetBrains Mono, monospace" }}>{e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{e.org} ↗</a> : e.org}</p>
              <p style={{ color: "#6f675c", fontSize: 11, lineHeight: 1.5 }}>{e.detail}</p>
            </div>)}
          </div>
        </div>
        </Reveal>
        <Reveal><div style={{ padding: "8px 0 22px" }}>
          <Slug>Skills & Tools</Slug>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Core Finance</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Financial Modeling", "Valuation (DCF, LBO, Comps)", "Quality of Earnings (QoE)", "Investment Analysis", "Transaction Analysis", "Portfolio Management", "Monte Carlo Simulation", "Econometrics", "Quantitative Research"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))", color: "#0d6d56", border: "1px solid rgba(13,109,86,0.15)", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(13,109,86,0.04)" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(13,109,86,0.12)";e.currentTarget.style.boxShadow="0 4px 12px rgba(13,109,86,0.1)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))";e.currentTarget.style.boxShadow="0 2px 6px rgba(13,109,86,0.04)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Tools</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Excel", "Python", "Bloomberg", "PitchBook", "Stata", "RStudio", "SQL", "PowerPoint", "Streamlit"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", color: "#6f675c", border: "1px solid #e3d5bf", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(64,52,32,0.05)" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1f5a9e40";e.currentTarget.style.color="#1f5a9e";e.currentTarget.style.boxShadow="0 4px 12px rgba(31,90,158,0.08)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.color="#6f675c";e.currentTarget.style.boxShadow="0 2px 6px rgba(64,52,32,0.05)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
          <div><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Certifications & Licenses</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[["Bloomberg Market Concepts", "Certified · Apr 2026 ↗", "#0d6d56", "/bmc-certificate.pdf"], ["FINRA SIE", "In Progress", "#b0741e", null], ["CFA Level I", "Planned", "#8a8072", null]].map(([name, status, c, url]) => { const inner = <>{name}<span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1, opacity: 0.75 }}>{status}</span></>; const st = { fontSize: 11, padding: "6px 14px", borderRadius: 8, background: `${c}0a`, color: c, border: `1px solid ${c}30`, cursor: url ? "pointer" : "default", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }; return url ? <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={st} title="View certificate">{inner}</a> : <span key={name} style={st}>{inner}</span>; })}
          </div></div>
        </div>
        </Reveal>
        <Reveal><div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 4, padding: "8px 0 22px" }}>
          <div>
            <Slug icon="#b0741e">Reading List</Slug>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{READING.map((b, i) => <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", border: "1px solid #e3d5bf", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.25s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#b0741e30";e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.transform="none"}} className="mrow"><div><div style={{ color: "#33302c", fontSize: 12, fontWeight: 500 }}>{b.title}</div><div style={{ color: "#8a8072", fontSize: 10 }}>{b.author}</div>{b.note && <div className="mnote" style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontSize: 12, color: "#6d549e", marginTop: 4 }}>“{b.note}” <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#a2977f", fontStyle: "normal", letterSpacing: 1 }}>— THE IDEA I USE</span></div>}</div><span style={{ fontSize: 8, padding: "3px 10px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace", background: b.s === "Reading" ? "rgba(31,90,158,0.1)" : b.s === "Done" ? "rgba(13,109,86,0.1)" : "rgba(111,103,92,0.08)", color: b.s === "Reading" ? "#1f5a9e" : b.s === "Done" ? "#0d6d56" : "#6f675c", border: `1px solid ${b.s === "Reading" ? "rgba(31,90,158,0.2)" : b.s === "Done" ? "rgba(13,109,86,0.2)" : "rgba(111,103,92,0.15)"}` }}>{b.s === "Done" ? "Completed" : b.s === "Ref" ? "Reference" : b.s}</span></div>)}</div>
          </div>
          <div>
            <Slug icon="#b3551d">Currently Exploring</Slug>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{ topic: "LBO Modeling & PE Deal Structuring", desc: "Completed full LBO models and IC pitch decks for EA and Jagex as graduate coursework — now extending the framework to new hypothetical buyout targets." },
                { topic: "Python for Equity Research Automation", desc: "Scripting DCF templates and data pipelines to streamline financial analysis workflows." },
                { topic: "Regression-Based Cost of Equity", desc: "Applying CAPM and multi-factor models in Excel to estimate required returns and alpha." },
                { topic: "AI Applications in Finance", desc: "Building this dashboard — exploring how AI can augment analyst workflows for research and market monitoring." }
              ].map((item, i) => <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "#f6eee1", border: "1px solid #e9ddc9" }}>
                <div style={{ color: "#33302c", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{item.topic}</div>
                <div style={{ color: "#6f675c", fontSize: 11, lineHeight: 1.5 }}>{item.desc}</div>
              </div>)}
            </div>
          </div>
        </div>
        </Reveal>
        <Reveal><div style={{ padding: "8px 0 22px" }}>
          <Slug icon="#33302c" right={<span style={{ fontSize: 8, color: "#a2977f", letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace" }}>EVERYTHING, ONE LIST</span>}>Work Index</Slug>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ARTIFACTS.map((a, i) => <div key={a.label} style={{ borderTop: i === 0 ? "none" : "1px solid #efe4d2" }}>
              {a.href
                ? <a href={a.href} target={a.href.startsWith("/") ? "_self" : "_blank"} rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "9px 2px", fontSize: 12.5, color: "#33302c", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, flexShrink: 0 }}>↗</span></a>
                : <button onClick={() => goAnchor(a.tab, a.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "9px 2px", fontSize: 12.5, color: "#33302c", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, flexShrink: 0 }}>→</span></button>}
            </div>)}
          </div>
        </div></Reveal>
        <Reveal><div style={{ padding: "8px 0 10px" }}>
          <Slug icon="#990f3d">Connect</Slug>
          <div className="connect-links" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{LINKS.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", color: "#33302c", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e3d5bf", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 12px rgba(64,52,32,0.07)", flex: "1 1 0", justifyContent: "center", minWidth: 140 }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5650"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e3d5bf"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(64,52,32,0.07)"; }}><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "#0d6d56" }}>{l.ic}</span>{l.label}</a>)}</div>
        </div></Reveal>
      </div>}

      {tab === "recruiter" && <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "14px 0 30px" }}>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Recruiter Packet — Everything on One Screen</div>
        <img src="/headshot.jpg" alt="Mason J. Bennett" style={{ width: 104, height: 104, borderRadius: 8, objectFit: "cover", objectPosition: "center 15%", border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: 3, margin: "0 auto 18px", display: "block", filter: "grayscale(0.18) sepia(0.1) contrast(1.05)" }} />
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 34, fontWeight: 400, color: "#262421", marginBottom: 6, lineHeight: 1 }}>Mason J. Bennett</h1>
        <p style={{ color: "#0d6d56", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", marginBottom: 20 }}>M.S. Finance · University of Arkansas · Dallas–Fort Worth, TX</p>
        <div style={{ borderTop: "1px solid #e9ddc9", borderBottom: "1px solid #e9ddc9", padding: "14px 0", marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {["4.0 GPA — M.S. Finance, Walton College of Business (May 2026)", "Info Tech Sector Analyst — Shollmier Investment Fund ($700K+, Spring 2026)", "Bloomberg Market Concepts certified · FINRA SIE in progress"].map(s => <div key={s} style={{ fontSize: 13, color: "#33302c", fontWeight: 500 }}>{s}</div>)}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 22px", borderRadius: 10, background: "#0d6d56", color: "#fdf8f0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Download Resume</a>
          <a href="https://linkedin.com/in/bennettmason" target="_blank" rel="noopener noreferrer" style={{ padding: "10px 22px", borderRadius: 10, background: "#fffdf9", color: "#33302c", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid #d8c8b0" }}>LinkedIn</a>
          <CopyEmail style={{ padding: "10px 22px", borderRadius: 10, background: "#fffdf9", color: "#33302c", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid #d8c8b0", fontFamily: "'JetBrains Mono',monospace" }} />
        </div>
        <div style={{ textAlign: "left", marginBottom: 22 }}>
          <div style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Work Samples</div>
          {ARTIFACTS.filter(a => a.label !== "Resume (PDF)").map((a, i) => <div key={a.label} style={{ borderTop: i === 0 ? "none" : "1px solid #efe4d2" }}>
            {a.href
              ? <a href={a.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 2px", fontSize: 12.5, color: "#33302c", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>↗</span></a>
              : <button onClick={() => goAnchor(a.tab, a.id)} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 2px", fontSize: 12.5, color: "#33302c", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>→</span></button>}
          </div>)}
        </div>
        <button onClick={() => setTab("home")} style={{ ...S.btn, padding: "8px 20px" }}>← Full site</button>
      </div>}
    </main>

    <footer style={{ padding: "26px 32px", borderTop: "1px solid #ddcfb8", background: "linear-gradient(180deg, transparent, rgba(247,240,229,0.8))", boxShadow: "0 -4px 30px rgba(64,52,32,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {LINKS.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8072", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#8a8072"}>{l.label}</a>)}
        <button onClick={() => setTab("recruiter")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8072", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#8a8072"}>For Recruiters</button>
        <button onClick={() => window.print()} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8072", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#8a8072"}>Print This Edition</button>
      </div>
      <div style={{ color: "#a2977f", fontSize: 9, fontFamily: "JetBrains Mono, monospace", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <span>Mason J. Bennett</span><span>·</span><span>M.S. Finance, Walton College</span><span>·</span><span>© {new Date().getFullYear()}</span><span>·</span><span>⌘K or 1-4</span>
      </div>
      <div style={{ color: "#b8ab97", fontSize: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, textAlign: "center", maxWidth: 640 }}>Set in Instrument Serif, Space Grotesk & JetBrains Mono · Composed in React, printed by Vercel · Market data by Finnhub · Written, designed & typeset by the editor</div>
    </footer>

    <style>{`
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes shimmer{0%{opacity:.4}50%{opacity:.7}100%{opacity:.4}}
      @keyframes breathe{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:1}}
      @keyframes typewriter{from{width:0}to{width:100%}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes glowPulse{0%,100%{opacity:0.4}50%{opacity:1}}
      @keyframes borderGlow{0%{border-color:rgba(13,109,86,0.2)}50%{border-color:rgba(13,109,86,0.4)}100%{border-color:rgba(13,109,86,0.2)}}
      *{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth;overflow-anchor:none}
      body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-variant-numeric:tabular-nums lining-nums}
      .mnote{display:none}
      .mrow:hover .mnote,.mrow:focus-within .mnote{display:block}
      @media (prefers-reduced-motion: no-preference){
        .tombstone{transition:transform 160ms ease-out, box-shadow 160ms ease-out}
        .tombstone:hover{transform:translateY(-4px) rotate(-0.35deg);box-shadow:0 16px 30px rgba(64,52,32,0.16)}
      }
      input[type=range]{accent-color:#0d6d56}
      @media print{
        .status-bar,header nav,header>div:last-child,.tape,footer,.bg-fx{display:none!important}
        body{background:#fff!important}
        main{opacity:1!important;transform:none!important;padding:0!important;max-width:100%!important}
        header{position:static!important;box-shadow:none!important;background:#fff!important}
      }
      ::selection{background:rgba(13,109,86,0.2);color:#33302c}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d8c8b0;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#a2977f}
      input:focus,textarea:focus,select:focus{border-color:#0d6d5660!important;box-shadow:0 0 0 4px rgba(13,109,86,0.12),0 0 20px rgba(13,109,86,0.08)!important}
      button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #0d6d5660;outline-offset:2px;border-radius:10px}
      button:hover{transform:translateY(-1px)}button:active{transform:translateY(0px)}
      @media(max-width:1140px){.statusbar-quotes{display:none!important}}
      @media(max-width:768px){
        .masthead{padding:12px 14px 10px!important}
        .masthead-side{display:none!important}
        .masthead-name{font-size:26px!important}
        .masthead-tag{font-size:6.5px!important;letter-spacing:2px!important}
        .mjb-mark{display:none!important}
        header{flex-wrap:wrap!important;padding:10px 14px!important;gap:8px!important}
        header nav{order:3;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
        header nav button{white-space:nowrap;font-size:11px!important;padding:6px 10px!important}
        main{padding:14px!important}
        .dash-grid-2{grid-template-columns:1fr!important}
        .about-stats{flex-direction:column!important;gap:10px!important}
        .about-stats>div>div:last-child{display:none!important}
        .portfolio-layout{flex-direction:column!important;align-items:center!important}
        .bio-layout{flex-direction:column!important;align-items:center!important;text-align:center!important}
        .bio-headshot{width:120px!important;height:120px!important}
        .bio-badges{justify-content:center!important}
        .hero-name{font-size:42px!important}
        .hero-sub{font-size:13px!important}
        .status-bar{display:none!important}
        .cmd-modal{width:92vw!important}
        .settings-modal{width:92vw!important}
        .connect-links{flex-direction:column!important}
        .connect-links a{min-width:unset!important}
        footer{padding:16px 14px!important}
      }
      @media(max-width:480px){
        header nav button span:first-child{display:none!important}
        main{padding:10px!important}
        .hero-name{font-size:32px!important}
        .bio-headshot{width:100px!important;height:100px!important}
      }
    `}</style>
  </div>;
}

const S = {
  root: { background: "#faf3ea", minHeight: "100vh", color: "#33302c", fontFamily: "'Space Grotesk',sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid #e0d1ba", background: "rgba(250,244,235,0.92)", backdropFilter: "blur(30px) saturate(1.4)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 30px rgba(64,52,32,0.06)" },
  tab: { background: "none", border: "none", color: "#8a8072", fontSize: 12, padding: "8px 16px", cursor: "pointer", borderRadius: 10, fontWeight: 500, transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", alignItems: "center", gap: 4 },
  tabA: { color: "#262421", background: "linear-gradient(135deg, rgba(13,109,86,0.15), rgba(31,90,158,0.1))", boxShadow: "0 0 20px rgba(13,109,86,0.15), 0 2px 8px rgba(64,52,32,0.07), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 0 #0d6d56", fontWeight: 600 },
  card: { background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", border: "1px solid #e3d5bf", borderRadius: 10, padding: 24, boxShadow: "0 8px 32px rgba(64,52,32,0.08), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" },
  cardTitle: { fontSize: 11, fontWeight: 600, color: "#6f675c", marginBottom: 16, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, paddingBottom: 12, borderBottom: "1px solid rgba(13,109,86,0.12)", display: "flex", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 44, fontWeight: 400, fontFamily: "'Instrument Serif',serif", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#262421" },
  chip: { display: "inline-block", padding: "7px 14px", borderRadius: 10, background: "rgba(255,253,249,0.85)", color: "#6f675c", fontSize: 11, fontWeight: 500, textDecoration: "none", border: "1px solid #e9ddc9", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", backdropFilter: "blur(8px)" },
  pCard: { display: "flex", flexDirection: "column", background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", border: "1px solid #e3d5bf", borderRadius: 10, padding: 24, transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer", boxShadow: "0 8px 32px rgba(64,52,32,0.08), 0 1px 0 rgba(255,255,255,0.6) inset, inset 3px 0 0 #0d6d5630" },
  btn: { background: "linear-gradient(135deg, #fffdf9, #fbf5ec)", color: "#0d6d56", border: "1px solid #0d6d5625", borderRadius: 10, padding: "7px 16px", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 2px 8px rgba(64,52,32,0.05)" },
  input: { background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 10, padding: "10px 14px", color: "#33302c", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", outline: "none", width: "100%", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" },
};
