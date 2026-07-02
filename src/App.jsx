import { useState, useEffect, useRef, useCallback } from "react";

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
  { title: "ML Credit Default Classifier", desc: "Machine-learning credit-risk model on a 70,000-observation near-prime loan dataset. Engineered a 60-seed bagged neural-network ensemble with LightGBM feature selection, pairwise-interaction features, and PCA — achieving 0.9931 ROC-AUC versus a 0.58 baseline.", tags: ["Python", "Machine Learning", "LightGBM", "Credit Risk"], status: "Completed", completed: "May 2026" },
  { title: "Personal Budgeting App", desc: "Full-stack personal finance tool with 11 modules: income & tax estimation (all 50 states, 2026 IRS brackets), 50/30/20 budget builder, expense tracking with CSV import and recurring templates, net worth monitoring, debt payoff planner (avalanche vs snowball), savings goals, investment projector with 401(k) career match calculator, FIRE calculator, and tax optimizer. Month-over-month dashboard with historical navigation.", tags: ["Python", "Streamlit", "Personal Finance", "Tax Planning"], status: "Completed", completed: "Apr 2026", updated: "Apr 12, 2026", img: "/projects/budgeting-app.png", url: "https://github.com/masonjbennett/budgeting-app", demo: "https://masonbennett-budget.streamlit.app/" },
  { title: "Portfolio Analytics App", desc: "Real-time equity portfolio construction and optimization tool with 6 analytical modules. Mean-variance optimization (GMV & Tangency), efficient frontier with CAL, CAPM beta/alpha regression, risk contribution decomposition (PRC), and estimation window sensitivity analysis. Features a tiered tooltip system (Beginner/Intermediate/Advanced) that adapts explanations to the user's knowledge level, custom portfolio builder with live frontier plotting, and CSV/Excel export.", tags: ["Python", "Streamlit", "Portfolio Optimization", "scipy"], status: "Completed", completed: "Apr 2026", updated: "Apr 11, 2026", img: "/projects/portfolio-app.png", url: "https://github.com/masonjbennett/portfolio-app", demo: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { title: "Applied Econometrics — Hurricane Michael", desc: "Regression analysis studying Hurricane Michael's impact on Florida housing prices across 67 counties. Built MLR and Difference-in-Difference models achieving R² of 0.59, identifying a $36,631 median price decline in affected counties. Analyzed median income, unemployment, elevation, FEMA risk indices, and population density as determinants.", tags: ["Stata", "Econometrics", "Regression Analysis", "Diff-in-Diff"], status: "Completed", completed: "Apr 2024", url: "/hurricane-paper.docx" },
];
const DEALS = [
  { id: "ea-take-private", value: "$55B", type: "Take-Private LBO", co: "Electronic Arts Inc.", sub: "NASDAQ: EA", detail: "38-page IM · 24-slide IC deck · 12-tab LBO model", date: "Apr 2026", model: "/deals/ea-lbo-model.xlsx", memo: "/deals/ea-memo.pdf",
    thesis: "Durable live-services cash flow supports an all-cash take-private; returns underwritten primarily to EBITDA growth and deleveraging, not multiple expansion.",
    assumptions: "$36.4B equity / $18.0B debt sources & uses; three-case operating projections spanning 1.27x–2.43x MoM and 4.8%–19.4% gross IRR; reconstruction diverges from reported terms where figures were not public.",
    takeaway: "Returns attribution — separating EBITDA growth, multiple expansion, and deleveraging — tells you more about a deal than the headline IRR." },
  { id: "jagex-lbo", value: "£900M", type: "Sponsor-to-Sponsor LBO", co: "Jagex Limited", sub: "CVC & Haveli ← The Carlyle Group", detail: "10-tab LBO model · 26-page IM · QoE bridge", date: "Apr 2026", model: "/deals/jagex-lbo-model.xlsx", memo: "/deals/jagex-memo.pdf",
    thesis: "Recurring subscription revenue with pricing power justifies a 13.4x FY23 EBITDA entry in a secondary buyout, underwriting a 1.77x MOIC / 12.1% IRR base case.",
    assumptions: "Quality-of-earnings bridge normalizing $56.4M reported to $75M pro-forma EBITDA ($18.6M add-backs); ~10% CAPM-derived WACC; full 2-and-20 fund waterfall; every figure footnoted to primary sources.",
    takeaway: "Cross-border, limited-disclosure deals live or die on quality of earnings — the add-back bridge was the real model." },
  { id: "hca-pitch", value: "NYSE: HCA", type: "Buy Recommendation", co: "HCA Healthcare", sub: "GFI Stock Pitch Competition", detail: "1 of 4 graduate teams · live Q&A defense", date: "Oct 2025",
    thesis: "Buy recommendation on HCA presented to the Garrison Financial Institute Advisory Board — one of four graduate teams invited to pitch industry practitioners.",
    assumptions: "Team-built financial projections and valuation; recommendation defended live under practitioner questioning.",
    takeaway: "Pitching to practitioners punishes any assumption you can't defend out loud — the Q&A was the real test." },
];
const ARTIFACTS = [
  { label: "Resume (PDF)", href: "/resume.pdf" },
  { label: "EA $55B take-private LBO — student reconstruction", tab: "projects", id: "ea-take-private" },
  { label: "Jagex £900M sponsor-to-sponsor LBO — student reconstruction", tab: "projects", id: "jagex-lbo" },
  { label: "HCA Healthcare stock pitch — GFI competition", tab: "projects", id: "hca-pitch" },
  { label: "Interactive mini-LBO model", tab: "projects", id: "lbo-sandbox" },
  { label: "Personal budgeting app — live demo", href: "https://masonbennett-budget.streamlit.app/" },
  { label: "Portfolio analytics app — live demo", href: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { label: "Bloomberg Market Concepts certificate (PDF)", href: "/bmc-certificate.pdf" },
  { label: "GitHub", href: "https://github.com/masonjbennett" },
  { label: "Shollmier Investment Fund — Garrison Financial Institute", href: "https://gfi.uark.edu/shollmier-fund.php" },
];
const EXPERIENCE = [
  { role: "M.S. Finance", org: "Walton College of Business", date: "2025–2026", type: "edu", detail: "4.0 GPA · Advanced Financial Modeling, Advanced Corporate Finance, Alternative Investments, New Venture (Private Equity), Financial Data Analytics II" },
  { role: "Analyst, Information Technology Sector — Shollmier Investment Fund", org: "Garrison Financial Institute · Walton College", url: "https://gfi.uark.edu/shollmier-fund.php", date: "2025–2026", type: "work", detail: "Covered the Information Technology sector for a live $700K+ fixed-income portfolio managed by graduate students." },
  { role: "B.S. Business Administration", org: "Walton College of Business", date: "2021–2024", type: "edu", detail: "3.62 GPA · Business Economics · Dean's List (5 semesters) · Funded 100% of undergraduate education through service-industry work" },
  { role: "Finance & Economics Tutor", org: "Self-employed · Fayetteville, AR", date: "2021–2024", type: "work", detail: "10+ students/semester. Tailored study guides. Helped improve grades 1–2 letters." },
  { role: "Event Manager", org: "Venue on Spring Creek · TX", date: "2016–2020", type: "work", detail: "100+ guest events. Coordinated vendors, supervised staff. 95%+ satisfaction." },
];
const READING = [
  { title: "Damodaran on Valuation", author: "Aswath Damodaran", s: "Reading" },
  { title: "The Intelligent Investor", author: "Benjamin Graham", s: "Done" },
  { title: "Investment Valuation", author: "Aswath Damodaran", s: "Done" },
  { title: "Barbarians at the Gate", author: "Burrough & Helyar", s: "Done" },
  { title: "Options, Futures & Derivatives", author: "John Hull", s: "Ref" },
  { title: "Financial Modeling & Valuation", author: "Paul Pignataro", s: "Reading" },
];
const LINKS = [
  { label: "LinkedIn", url: "https://linkedin.com/in/bennettmason", ic: "in" },
  { label: "GitHub", url: "https://github.com/masonjbennett", ic: "gh" },
  { label: "Resume", url: "/resume.pdf", ic: "cv" },
  { label: "Email", url: "mailto:bennettmasonj@gmail.com", ic: "@" },
];
const NEWS_CATS = [
  { id: "markets", label: "Markets", q: "stock market news today", color: "#0d6d56", count: 15 },
  { id: "macro", label: "Macro & Fed", q: "Federal Reserve interest rates economic policy", color: "#1f5a9e", count: 5 },
  { id: "deals", label: "M&A / PE", q: "mergers acquisitions private equity deals", color: "#7d5fb2", count: 10 },
  { id: "tech", label: "Tech", q: "Big Tech earnings technology sector news", color: "#6d549e", count: 15 },
  { id: "crypto", label: "Crypto", q: "Bitcoin cryptocurrency market", color: "#b0741e", count: 10 },
  { id: "global", label: "Global", q: "global economy geopolitics trade", color: "#990f3d", count: 10 },
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

// ============ SMART REFRESH ============
function getSmartInterval() {
  const now = new Date(), h = now.getHours(), m = now.getMinutes(), d = now.getDay();
  const mktOpen = d > 0 && d < 6 && ((h === 9 && m >= 30) || (h > 9 && h < 16));
  const pre = d > 0 && d < 6 && h >= 7 && (h < 9 || (h === 9 && m < 30));
  if (mktOpen || pre) return { interval: 30, label: "30m (market)" };
  return { interval: 120, label: "2h (off-hours)" };
}

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
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: apiHeaders(key), body: JSON.stringify(body) });
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

async function fetchNews(cat, key) {
  if (!key) return null;
  const cached = cacheGet(`mb_news_${cat.id}`, 30);
  if (cached) return cached;
  try { const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 3000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Search for the latest ${cat.q}.\n${SRC_GUIDE}\nReturn ONLY a JSON array of top ${cat.count} articles: [{"title":"...","source":"...","summary":"one sentence","url":"...","time":"relative"}]. Raw JSON only.` }] }); const raw = extractText(d); if (!raw) return null; const match = raw.match(/\[[\s\S]*\]/); const result = match ? JSON.parse(match[0]) : JSON.parse(raw); if (result) cacheSet(`mb_news_${cat.id}`, result); return result; } catch (e) { console.error("News fetch error:", e); return null; }
}
async function fetchBriefing(type, key, forceRefresh = false) {
  const p = { morning: `Senior equity research analyst morning briefing. Search latest market news. Cover: 1) Overnight global markets 2) Macro/Fed developments 3) Pre-market sector moves 4) M&A/deals 5) What to watch today.\n${SRC_GUIDE}\nCite sources inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}]. Plain paragraphs, no markdown.`, close: `Senior equity research analyst close briefing. Search today's results. Cover: 1) Index closes with % 2) Session drivers 3) Stock movers 4) After-hours 5) Tomorrow watch.\n${SRC_GUIDE}\nCite inline [Reuters]. End with ---SOURCES--- then JSON: [{"name":"...","url":"..."}]. Plain paragraphs, no markdown.` };
  if (!key) return null;
  if (!forceRefresh) { const cached = cacheGet(`mb_brief_${type}`, 60); if (cached) return cached; }
  try { const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 4000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: p[type] }] }); const raw = extractTextMulti(d); if (!raw) return null; let text = raw, sources = []; const sep = raw.indexOf("---SOURCES---"); if (sep !== -1) { text = raw.slice(0, sep).trim(); try { const srcRaw = raw.slice(sep + 13).trim().replace(/```json|```/g, "").trim(); const srcMatch = srcRaw.match(/\[[\s\S]*\]/); sources = JSON.parse(srcMatch ? srcMatch[0] : srcRaw); } catch {} } if (!sources.length) { const m = text.match(/\[([A-Z][A-Za-z\s\.&']+?)\]/g); if (m) sources = [...new Set(m.map(x => x.slice(1, -1).trim()))].map(n => ({ name: n, url: SRC_URLS[n] || "#" })); } const result = { text, sources }; cacheSet(`mb_brief_${type}`, result); return result; } catch (e) { console.error("Briefing error:", e); return null; }
}
async function verifyBriefing(t, key) {
  if (!key) return null;
  try { const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 3000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Fact-check this briefing. Extract factual claims, verify each via web search. Return ONLY JSON: {"summary":{"verified":0,"unverified":0,"discrepancy":0,"total":0,"confidence_pct":0},"claims":[{"claim":"...","status":"verified|unverified|minor_discrepancy","note":"...","source":"..."}]}\n\n"""\n${t}\n"""` }] }); const raw = extractText(d); if (!raw) return null; const match = raw.match(/\{[\s\S]*\}/); if (match) return JSON.parse(match[0]); return JSON.parse(raw); } catch (e) { console.error("Verify error:", e); return null; }
}
async function fetchSoWhat(t, type, key) {
  if (!key) return null;
  try { const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: `Senior strategist: from this ${type} briefing, identify 3-5 most impactful developments. Return ONLY JSON array: [{"headline":"5-8 words","development":"one sentence","why_it_matters":"2-3 sentences","who_affected":"sectors/companies","second_order":"what happens next","takeaway":"one actionable sentence"}]\n\n"""\n${t}\n"""` }] }); const raw = extractText(d); if (!raw) return null; const match = raw.match(/\[[\s\S]*\]/); if (match) return JSON.parse(match[0]); return JSON.parse(raw); } catch (e) { console.error("SoWhat error:", e); return null; }
}
async function fetchRegime(key) {
  if (!key) return null;
  const cached = cacheGet("mb_regime", 15);
  if (cached) return cached;
  try {
    const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 1000, tools: [{ type: "web_search_20250305", name: "web_search" }],
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
    const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 1000, tools: [{ type: "web_search_20250305", name: "web_search" }],
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
          if (d.c) results[i] = { ...tickers[i], price: d.c.toFixed(2), change: d.dp ? d.dp.toFixed(2) : "0.00", loading: false };
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
        if (cached) { if (!cancelled) { setP(cached); setLive(true); } return; }
        const r = await fetch(`/api/quotes?symbols=${tickers.map(t => t.symbol).join(",")}`);
        if (!r.ok) throw 0;
        const d = await r.json();
        const mapped = tickers.map(t => d[t.symbol] && d[t.symbol].c ? { ...t, price: d[t.symbol].c.toFixed(2), change: (d[t.symbol].dp || 0).toFixed(2) } : null);
        if (mapped.filter(Boolean).length < tickers.length / 2) throw 0;
        const filled = mapped.map((m, i) => m || { ...tickers[i], price: "—", change: "0.00" });
        if (!cancelled) { setP(filled); setLive(true); cacheSet("mb_prices_proxy", filled); }
      } catch { startSim(); }
    })();
    return () => { cancelled = true; if (iv) clearInterval(iv); };
  }, [finnhubKey]);
  return { prices: p, live: !!finnhubKey || live };
}

// ============ INFO TOOLTIP ============
function Info({ text, link, linkLabel }) {
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  const enter = () => { clearTimeout(timer.current); setShow(true); };
  const leave = () => { timer.current = setTimeout(() => setShow(false), 400); };
  return <span style={{ position: "relative", display: "inline-flex", marginLeft: 6 }} onMouseEnter={enter} onMouseLeave={leave}>
    <span style={{ width: 15, height: 15, borderRadius: 8, background: show ? "rgba(13,109,86,0.15)" : "rgba(111,103,92,0.1)", border: `1px solid ${show ? "rgba(13,109,86,0.3)" : "rgba(111,103,92,0.2)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: show ? "#0d6d56" : "#8a8072", cursor: "help", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, transition: "all 0.2s" }}>?</span>
    {show && <div onMouseEnter={enter} onMouseLeave={leave} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fffdf9", border: "1px solid #e3d5bf", borderRadius: 12, padding: "14px 18px", fontSize: 11, color: "#4a443c", lineHeight: 1.7, width: 300, maxHeight: "70vh", overflowY: "auto", zIndex: 200, boxShadow: "0 12px 40px rgba(64,52,32,0.14), 0 0 0 1px rgba(13,109,86,0.05)", fontFamily: "'Space Grotesk',sans-serif", textTransform: "none", letterSpacing: 0, fontWeight: 400, animation: "fadeIn 0.15s ease", cursor: "default" }}>{text}{link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 10, color: "#0d6d56", textDecoration: "none", fontFamily: "'JetBrains Mono',monospace", padding: "4px 10px", borderRadius: 6, background: "rgba(13,109,86,0.06)", border: "1px solid rgba(13,109,86,0.15)", transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(13,109,86,0.12)";e.currentTarget.style.borderColor="rgba(13,109,86,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(13,109,86,0.06)";e.currentTarget.style.borderColor="rgba(13,109,86,0.15)"}}>{linkLabel || "Learn more"} ↗</a>}</div>}
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
  return <button onClick={() => { try { navigator.clipboard.writeText(`https://masonjbennett.com/?tab=${tab}#${id}`); setOk(true); setTimeout(() => setOk(false), 1600); } catch {} }} title="Copy a direct link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 8, color: ok ? "#0d6d56" : "#a2977f", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, padding: 0, textTransform: "uppercase" }}>{ok ? "✓ link copied" : "§ copy link"}</button>;
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
  useEffect(() => { const el = ref.current; if (!el || !("IntersectionObserver" in window)) { setInV(true); return; } const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInV(true); ob.disconnect(); } }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }); ob.observe(el); return () => ob.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: inV ? 1 : 0, transform: inV ? "none" : "translateY(18px)", transition: "all 0.7s cubic-bezier(0.4,0,0.2,1)" }}>{children}</div>;
}
const Kicker = ({ n, t }) => <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase" }}>{n} · {t}</span><div style={{ width: 54, borderTop: "1px solid rgba(13,109,86,0.35)" }} /></div>;
const Orn = () => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "24px 0" }}><div style={{ width: 60, borderTop: "1px solid #ddcfb8" }} /><span style={{ color: "#0d6d56", fontSize: 8 }}>◆</span><div style={{ width: 60, borderTop: "1px solid #ddcfb8" }} /></div>;

// ============ SMALL COMPONENTS ============
function Spark({ pos, w = 88, h = 28 }) { const id = useRef(`s${Math.random().toString(36).slice(2,6)}`); const glow = useRef(`g${Math.random().toString(36).slice(2,6)}`); const pts = useRef(Array.from({length:22},(_,i)=>{const x=(i/21)*w,y=h/2+(pos?-1:1)*i*0.35+(Math.random()-0.5)*h*0.45;return`${x},${Math.max(2,Math.min(h-2,y))}`;}).join(" ")); return <svg width={w} height={h} style={{display:"block"}}><defs><linearGradient id={id.current} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={pos?"#0d6d56":"#b2342b"} stopOpacity="0.25"/><stop offset="100%" stopColor={pos?"#0d6d56":"#b2342b"} stopOpacity="0"/></linearGradient></defs><polyline points={pts.current+` ${w},${h} 0,${h}`} fill={`url(#${id.current})`}/><polyline points={pts.current} fill="none" stroke={pos?"#0d6d56":"#b2342b"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
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
    {!apiKey&&!data&&<p style={{color:"#8a8072",fontSize:12,textAlign:"center",padding:"12px 0",lineHeight:1.6}}>Live market regime analysis — tracks VIX, Fear & Greed Index, and 10Y Treasury yield in real time.<br/><span style={{fontSize:10,color:"#a2977f"}}>Powered by Claude AI + web search</span></p>}
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
    const d = await callAPI(key, { model: "claude-sonnet-4-20250514", max_tokens: 1500, tools: [{ type: "web_search_20250305", name: "web_search" }],
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
function Notes(){const[notes,setNotes]=useState(()=>{try{const s=localStorage.getItem("mb_notes");return s?JSON.parse(s):[];}catch{return[];}});const[input,setInput]=useState("");const updateNotes=n=>{setNotes(n);localStorage.setItem("mb_notes",JSON.stringify(n))};const add=()=>{if(!input.trim())return;updateNotes([{text:input.trim(),time:new Date().toLocaleString(),id:Date.now()},...notes]);setInput("")};const rm=id=>updateNotes(notes.filter(n=>n.id!==id));return <section style={S.card}><h2 style={S.cardTitle}><span style={{color:"#990f3d"}}>◆</span> Quick Notes<Info text="Scratch pad for trade ideas, research questions, and reminders. Notes persist in browser localStorage across sessions." /></h2><div style={{display:"flex",gap:8,marginBottom:notes.length?10:0}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Trade idea, research note, reminder..." style={{flex:1,background:"#f6eee1",border:"1px solid #e9ddc9",borderRadius:8,padding:"8px 12px",color:"#33302c",fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:"none"}}/><button onClick={add} style={{...S.btn,padding:"8px 16px"}}>Add</button></div>{notes.length===0&&<p style={{color:"#8a8072",fontSize:11,textAlign:"center",padding:"8px 0"}}>Jot down ideas, questions, or reminders</p>}{notes.map(n=><div key={n.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:6,background:"#f6eee1",border:"1px solid #e9ddc9",marginBottom:4}}><div><div style={{color:"#33302c",fontSize:12}}>{n.text}</div><div style={{color:"#8a8072",fontSize:9,fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>{n.time}</div></div><button onClick={()=>rm(n.id)} style={{background:"none",border:"none",color:"#8a8072",cursor:"pointer",fontSize:14,padding:"4px 8px"}}>×</button></div>)}</section>;}

// ============ HERO + CMD ============
function Hero(){const[ph,setPh]=useState(0);useEffect(()=>{const timers=[setTimeout(()=>setPh(1),350),setTimeout(()=>setPh(2),1000),setTimeout(()=>setPh(3),1800),setTimeout(()=>setPh(4),2600)];return()=>timers.forEach(clearTimeout)},[]);return <div style={{position:"fixed",inset:0,background:"#faf3ea",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 1s ease",opacity:ph>=4?0:1,pointerEvents:ph>=4?"none":"all"}} onClick={()=>setPh(4)}><div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(13,109,86,0.06) 0%,transparent 70%)",animation:"breathe 4s ease-in-out infinite"}}/><div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(31,90,158,0.04) 0%,transparent 70%)",animation:"breathe 5s ease-in-out infinite",animationDelay:"1s",left:"35%",top:"55%"}}/><div style={{position:"absolute",top:0,left:0,right:0,height:10,background:"#2b2825"}}/><div style={{position:"absolute",top:10,left:0,right:0,height:2,background:"#0d6d56",transform:ph>=1?"scaleX(1)":"scaleX(0)",transition:"transform 1.2s cubic-bezier(0.4,0,0.2,1)"}}/><div style={{position:"relative",textAlign:"center"}}><div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#0d6d56",letterSpacing:8,textTransform:"uppercase",marginBottom:28,opacity:ph>=1?1:0,transform:`translateY(${ph>=1?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)"}}>masonjbennett.com</div><div style={{width:360,maxWidth:"72vw",margin:"0 auto 26px",borderTop:"1px solid #33302c",borderBottom:"1px solid #33302c",height:5,transform:ph>=2?"scaleX(1)":"scaleX(0)",transition:"transform 0.9s cubic-bezier(0.4,0,0.2,1)"}}/><h1 className="hero-name" style={{fontSize:72,fontWeight:400,fontFamily:"'Instrument Serif',serif",color:"#262421",lineHeight:1,marginBottom:18,opacity:ph>=2?1:0,transform:`translateY(${ph>=2?0:20}px) scale(${ph>=2?1:0.95})`,transition:"all 1s cubic-bezier(0.4,0,0.2,1)",letterSpacing:"-0.02em"}}>Mason J. Bennett</h1><p className="hero-sub" style={{fontSize:15,color:"#6f675c",letterSpacing:2,opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)",fontFamily:"'Space Grotesk',sans-serif"}}>M.S. Finance '26 · University of Arkansas · Dallas–Fort Worth, TX</p><div style={{width:60,margin:"26px auto 0",borderTop:"1px solid #0d6d56",transform:ph>=3?"scaleX(1)":"scaleX(0)",transition:"transform 0.8s cubic-bezier(0.4,0,0.2,1)"}}/><div style={{display:"flex",gap:16,marginTop:24,justifyContent:"center",opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s"}}>{["IB","PE","WM","CF"].map(t=><span key={t} style={{fontSize:10,padding:"4px 14px",borderRadius:20,border:"1px solid rgba(13,109,86,0.2)",color:"#0d6d56",fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,background:"rgba(13,109,86,0.05)"}}>{t}</span>)}</div></div><div style={{position:"absolute",bottom:36,fontSize:9,color:"#a2977f",fontFamily:"'JetBrains Mono',monospace",letterSpacing:3,textTransform:"uppercase",opacity:ph>=1&&ph<4?0.8:0,transition:"opacity 1.2s"}}>click anywhere to skip</div></div>;}
function Cmd({open,onClose,onNav}){const[q,setQ]=useState("");const ref=useRef();const items=[{l:"Home",t:"home"},{l:"Projects",t:"projects"},{l:"Markets",t:"markets"},{l:"News",t:"news"},...QLINKS.map(l=>({l:l.n,u:l.u}))];const f=items.filter(i=>i.l.toLowerCase().includes(q.toLowerCase()));useEffect(()=>{if(open&&ref.current){ref.current.focus();setQ("")}},[open]);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(51,48,46,0.45)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:100,animation:"fadeIn 0.15s"}} onClick={onClose}><div style={{background:"#fffdf9",border:"1px solid #d8c8b0",borderRadius:16,width:520,overflow:"hidden",boxShadow:"0 32px 80px rgba(64,52,32,0.14)"}} onClick={e=>e.stopPropagation()} className="cmd-modal"><div style={{padding:"16px 20px",borderBottom:"1px solid #e9ddc9",display:"flex",alignItems:"center",gap:12}}><span style={{color:"#0d6d56"}}>⌘</span><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{flex:1,background:"none",border:"none",outline:"none",color:"#33302c",fontSize:15}}/><kbd style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:"#e9ddc9",color:"#8a8072",border:"1px solid #d8c8b0",fontFamily:"'JetBrains Mono',monospace"}}>ESC</kbd></div><div style={{maxHeight:320,overflowY:"auto",padding:6}}>{f.map((item,i)=><button key={i} onClick={()=>{if(item.t)onNav(item.t);else window.open(item.u,"_blank");onClose()}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",background:"none",border:"none",color:"#33302c",fontSize:14,cursor:"pointer",borderRadius:10,textAlign:"left",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#e9ddc9"} onMouseLeave={e=>e.currentTarget.style.background="none"}><span style={{color:"#0d6d56",width:20,textAlign:"center"}}>→</span><span>{item.l}</span>{item.u&&<span style={{marginLeft:"auto",fontSize:10,color:"#8a8072"}}>↗</span>}</button>)}</div></div></div>;}

// ============ BRIEFINGS (compact) ============
function Briefings({apiKey}){const[morning,setMorning]=useState(null),[close,setClose]=useState(null),[vM,setVM]=useState(null),[vC,setVC]=useState(null),[swM,setSwM]=useState(null),[swC,setSwC]=useState(null),[lM,setLM]=useState(false),[lC,setLC]=useState(false),[vLM,setVLM]=useState(false),[vLC,setVLC]=useState(false),[swLM,setSwLM]=useState(false),[swLC,setSwLC]=useState(false),[tM,setTM]=useState(null),[tC,setTC]=useState(null),[showCl,setShowCl]=useState(false),[showSW,setShowSW]=useState(true),[tab,setTab]=useState(()=>new Date().getHours()>=16?"close":"morning");const sugg=new Date().getHours()>=16?"close":"morning";
const gen=async(type,force=false)=>{if(!apiKey)return;const sL=type==="morning"?setLM:setLC,sD=type==="morning"?setMorning:setClose,sT=type==="morning"?setTM:setTC,sV=type==="morning"?setVM:setVC,sSW=type==="morning"?setSwM:setSwC,sVL=type==="morning"?setVLM:setVLC,sSWL=type==="morning"?setSwLM:setSwLC;sL(true);sV(null);sSW(null);const r=await fetchBriefing(type,apiKey,force);if(r){sD(r);sT(new Date())}sL(false);if(r?.text){sVL(true);const v=await verifyBriefing(r.text,apiKey);if(v)sV(v);sVL(false);sSWL(true);const sw=await fetchSoWhat(r.text,type,apiKey);if(sw)sSW(sw);sSWL(false)}};
const data=tab==="morning"?morning:close,loading=tab==="morning"?lM:lC,verifying=tab==="morning"?vLM:vLC,verify=tab==="morning"?vM:vC,soWhat=tab==="morning"?swM:swC,swLoad=tab==="morning"?swLM:swLC,time=tab==="morning"?tM:tC;
const SC={verified:"#0d6d56",minor_discrepancy:"#b0741e",unverified:"#b2342b"},SI={verified:"✓",minor_discrepancy:"~",unverified:"✗"},SL={verified:"Verified",minor_discrepancy:"Discrepancy",unverified:"Unverified"};
return <div style={{...S.card,background:"linear-gradient(135deg,#f6eee1,#fdf8f0,#f6eee1)",border:"1px solid rgba(13,109,86,0.1)",boxShadow:"0 12px 48px rgba(64,52,32,0.1), 0 0 40px rgba(13,109,86,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:`radial-gradient(circle,${tab==="morning"?"rgba(176,116,30,0.03)":"rgba(90,95,184,0.05)"} 0%,transparent 70%)`,pointerEvents:"none"}}/>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,position:"relative",flexWrap:"wrap",gap:12}}><div><div style={{display:"flex",gap:6,marginBottom:8}}>{["morning","close"].map(t=><button key={t} onClick={()=>setTab(t)} style={{fontSize:12,padding:"6px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,transition:"all 0.25s",border:"1px solid",display:"flex",alignItems:"center",gap:8,background:tab===t?(t==="morning"?"#b0741e10":"#56599e10"):"transparent",borderColor:tab===t?(t==="morning"?"#b0741e30":"#56599e30"):"#e9ddc9",color:tab===t?(t==="morning"?"#b0741e":"#56599e"):"#8a8072"}}><span style={{display:"inline-flex"}}>{t==="morning"?<SunIc/>:<MoonIc/>}</span>{t==="morning"?"Morning":"Close"} Brief{sugg===t&&<span style={{width:5,height:5,borderRadius:3,background:t==="morning"?"#b0741e":"#56599e",animation:"pulse 2s infinite"}}/>}</button>)}</div><p style={{color:"#8a8072",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>AI briefing → fact-check → implications {time?`· ${time.toLocaleTimeString()}`:""}</p></div><button onClick={()=>gen(tab,!!data)} disabled={loading||verifying} style={{...S.btn,opacity:(loading||verifying)?0.5:1}}>{loading?"⟳ Generating...":verifying||swLoad?"⟳ Analyzing...":data?"↻ Regenerate":"Generate Brief"}</button></div>
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

// ============ NEWS FEED ============
function NewsFeed({apiKey}){const[articles,setArticles]=useState({}),[loading,setLoading]=useState({}),[activeCat,setActiveCat]=useState("markets"),[lastFetch,setLastFetch]=useState({});const[auto,setAuto]=useState(true),[cd,setCd]=useState(()=>getSmartInterval().interval),[fetchingAll,setFetchingAll]=useState(false),[si,setSi]=useState(()=>getSmartInterval());useEffect(()=>{const iv=setInterval(()=>setSi(getSmartInterval()),60000);return()=>clearInterval(iv)},[]);const fetchCat=useCallback(async cat=>{if(!apiKey)return;setLoading(p=>({...p,[cat.id]:true}));const r=await fetchNews(cat,apiKey);if(r){setArticles(p=>({...p,[cat.id]:r}));setLastFetch(p=>({...p,[cat.id]:new Date()}))}setLoading(p=>({...p,[cat.id]:false}))},[apiKey]);const fetchAll=useCallback(async()=>{setFetchingAll(true);for(let i=0;i<NEWS_CATS.length;i++){await fetchCat(NEWS_CATS[i]);if(i<NEWS_CATS.length-1)await delay(1500);}setFetchingAll(false);setCd(getSmartInterval().interval)},[fetchCat]);useEffect(()=>{if(!auto)return;const iv=setInterval(()=>{setSi(getSmartInterval());setCd(c=>{if(c<=1){fetchAll();return getSmartInterval().interval}return c-1})},60000);return()=>clearInterval(iv)},[auto,fetchAll]);const cat=NEWS_CATS.find(c=>c.id===activeCat),arts=articles[activeCat],total=Object.values(articles).reduce((s,a)=>s+(a?a.length:0),0);
return <div><Briefings apiKey={apiKey}/><div style={{height:16}}/>
<div style={{...S.card,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}><div><h2 style={{color:"#33302c",fontSize:20,fontFamily:"'Instrument Serif',serif",marginBottom:3}}>Live News Feed</h2><p style={{color:"#8a8072",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>AI web search · {total} articles · {Object.keys(articles).length}/{NEWS_CATS.length}</p></div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace"}}>Auto</span><button onClick={()=>setAuto(!auto)} style={{width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",background:auto?"#0d6d56":"#e9ddc9",position:"relative",transition:"background 0.3s"}}><div style={{width:16,height:16,borderRadius:8,background:"#fff",position:"absolute",top:2,left:auto?18:2,transition:"left 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/></button></div><span style={{fontSize:9,color:"#8a8072",fontFamily:"'JetBrains Mono',monospace",padding:"3px 8px",borderRadius:6,background:"#f6eee1",border:"1px solid #e9ddc9"}}>{si.label}</span>{auto&&<span style={{fontSize:10,color:"#6f675c",fontFamily:"'JetBrains Mono',monospace"}}>{cd}m</span>}<button onClick={fetchAll} disabled={fetchingAll} style={{...S.btn,opacity:fetchingAll?0.5:1}}>{fetchingAll?"⟳...":"⟳ Fetch All"}</button></div></div>
<div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>{NEWS_CATS.map(c=><button key={c.id} onClick={()=>{setActiveCat(c.id);if(!articles[c.id]&&!loading[c.id])fetchCat(c)}} style={{background:activeCat===c.id?`${c.color}12`:"#f6eee1",border:`1px solid ${activeCat===c.id?`${c.color}30`:"#e9ddc9"}`,color:activeCat===c.id?c.color:"#8a8072",fontSize:11,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:500,transition:"all 0.2s",display:"flex",alignItems:"center",gap:7}}><span style={{width:5,height:5,borderRadius:3,background:articles[c.id]?c.color:"#e9ddc9",animation:loading[c.id]?"pulse 1s infinite":"none"}}/>{c.label}<span style={{fontSize:9,opacity:0.4}}>({c.count})</span></button>)}</div>
<div style={S.card}>{!arts&&!loading[activeCat]&&<div style={{textAlign:"center",padding:"50px 20px"}}><p style={{color:"#6f675c",marginBottom:14}}>No {cat.label} articles yet</p><button onClick={()=>fetchCat(cat)} style={{...S.btn,padding:"10px 24px"}}>Fetch {cat.label}</button></div>}{loading[activeCat]&&!arts&&<div style={{display:"flex",flexDirection:"column",gap:14,padding:8}}>{[1,2,3,4,5].map(i=><div key={i} style={{padding:"10px 0",animation:"shimmer 1.5s infinite",animationDelay:`${i*0.12}s`}}><div style={{height:13,width:`${55+Math.random()*35}%`,background:"#e9ddc9",borderRadius:5,marginBottom:8}}/><div style={{height:10,width:`${30+Math.random()*40}%`,background:"#efe4d2",borderRadius:5}}/></div>)}</div>}{arts&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:10,color:cat.color,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:2}}>{cat.label} · {arts.length}</span><button onClick={()=>fetchCat(cat)} style={{background:"none",border:"none",color:"#8a8072",fontSize:10,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>↻</button></div>{arts.map((a,i)=><a key={i} href={a.url||"#"} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"10px 10px",borderRadius:8,textDecoration:"none",transition:"all 0.15s",borderLeft:"2px solid transparent"}} onMouseEnter={e=>{e.currentTarget.style.background="#e9ddc918";e.currentTarget.style.borderLeftColor=cat.color+"50"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderLeftColor="transparent"}}><div style={{display:"flex",gap:10,alignItems:"baseline"}}><span style={{color:`${cat.color}35`,fontSize:9,fontFamily:"'JetBrains Mono',monospace",minWidth:16}}>{String(i+1).padStart(2,"0")}</span><div style={{flex:1}}><h3 style={{color:"#33302c",fontSize:13,fontWeight:500,lineHeight:1.5,marginBottom:4}}>{a.title}</h3><p style={{color:"#6f675c",fontSize:11,lineHeight:1.4,marginBottom:4}}>{a.summary}</p><div style={{display:"flex",gap:14,fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}><span style={{color:cat.color}}>{a.source}</span><span style={{color:"#8a8072"}}>{a.time}</span></div></div></div></a>)}</div>}</div>
</div>;}

// ============ LBO SANDBOX ============
function LBOSandbox() {
  const [inp, setInp] = useState({ entry: 10, debt: 60, growth: 6, exit: 10, years: 5 });
  const set = k => e => setInp(p => ({ ...p, [k]: parseFloat(e.target.value) }));
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
    <p style={{ fontSize: 9, color: "#a2977f", marginTop: 16, lineHeight: 1.6 }}>Simplified and illustrative — $100M entry EBITDA (indexed), 45% of EBITDA converts to debt paydown annually, no fees or taxes. Built to demonstrate LBO mechanics, not investment advice.</p>
  </div>;
}

// ============ MAIN ============
function SettingsPanel({ apiKey, setApiKey, finnhubKey, setFinnhubKey, open, onClose }) {
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
  const [showSettings, setShowSettings] = useState(false);
  const { prices, live: pricesLive } = usePrices(TICKERS, finnhubKey);
  const [tab, setTabRaw] = useState(() => { try { const q = new URLSearchParams(window.location.search).get("tab"); return ["home", "projects", "markets", "news", "recruiter"].includes(q) ? q : "home"; } catch { return "home"; } }), [hovP, setHovP] = useState(null), [cmd, setCmd] = useState(false), [showHero, setShowHero] = useState(() => { try { return !sessionStorage.getItem("mb_intro"); } catch { return true; } }), [mounted, setMounted] = useState(false);
  const setTab = (t) => { setTabRaw(t); window.scrollTo(0, 0); };
  const goAnchor = (t, id) => { setTabRaw(t); setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); else window.scrollTo(0, 0); }, 80); };
  useEffect(() => { if (!window.location.hash) return; const id = window.location.hash.slice(1); const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), showHero ? 3200 : 300); return () => clearTimeout(t); }, []);
  useEffect(() => { window.scrollTo(0, 0); if (!showHero) { setMounted(true); return; } try { sessionStorage.setItem("mb_intro", "1"); } catch {} const t = setTimeout(() => { setShowHero(false); setMounted(true); }, 2900); return () => clearTimeout(t); }, []);
  useEffect(() => { const h = e => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(true); } if (e.key === "Escape") setCmd(false); if (!e.metaKey && !e.ctrlKey && !e.altKey && ["1", "2", "3", "4"].includes(e.key) && !e.target.closest("input") && !e.target.closest("textarea")) setTab(["home", "projects", "markets", "news"][+e.key - 1]); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  const tabs = [{ id: "home", l: "Home" }, { id: "projects", l: "Projects" }, { id: "markets", l: "Markets" }, { id: "news", l: "News" }];

  return <div style={S.root}>
    {showHero && <Hero />}
    <Cmd open={cmd} onClose={() => setCmd(false)} onNav={t => setTab(t)} />
    <SettingsPanel apiKey={apiKey} setApiKey={setApiKey} finnhubKey={finnhubKey} setFinnhubKey={setFinnhubKey} open={showSettings} onClose={() => setShowSettings(false)} />
    <div className="bg-fx" style={{ position: "fixed", top: -200, right: -100, width: 900, height: 900, background: "radial-gradient(circle,rgba(13,109,86,0.045) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 8s ease-in-out infinite" }} />
    <div className="bg-fx" style={{ position: "fixed", bottom: -100, left: -100, width: 700, height: 700, background: "radial-gradient(circle,rgba(31,90,158,0.035) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 10s ease-in-out infinite", animationDelay: "2s" }} />
    <div className="bg-fx" style={{ position: "fixed", top: "30%", right: -100, width: 600, height: 600, background: "radial-gradient(circle,rgba(109,84,158,0.025) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 12s ease-in-out infinite", animationDelay: "4s" }} />
    <div className="bg-fx" style={{ position: "fixed", inset: 0, opacity: 0.045, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')", pointerEvents: "none" }} />

    <div className="status-bar" style={{ background: "#2b2825", padding: "7px 32px", display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "JetBrains Mono, monospace", color: "#cfc5b4", letterSpacing: 1, position: "relative", zIndex: 2 }}>
      <span>WALTON COLLEGE OF BUSINESS · UNIVERSITY OF ARKANSAS · DALLAS–FORT WORTH, TX</span>
      <span><span style={{ color: "#3ecf8e" }}>●</span> OPEN TO OPPORTUNITIES · IB / PE / WEALTH MANAGEMENT / CORPORATE FINANCE</span>
    </div>

    <div className="masthead" style={{ background: "rgba(250,244,235,0.95)", padding: "20px 32px 16px", position: "relative", zIndex: 90 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1300, margin: "0 auto", gap: 16 }}>
        <div className="masthead-side" style={{ flex: "1 1 0", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#8a8072", letterSpacing: 1.5, textTransform: "uppercase" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
        <div style={{ textAlign: "center" }}>
          <div className="masthead-name" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: "#262421", letterSpacing: "-0.015em", lineHeight: 1 }}>Mason J. Bennett</div>
          <div className="masthead-tag" style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase", marginTop: 7 }}>Investment Banking · Private Equity · Wealth Management · Corporate Finance</div>
        </div>
        <div className="masthead-side" style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end" }}><MktBadge /></div>
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
        <div style={{ marginBottom: 24, animation: "fadeUp 0.5s ease both", padding: "20px 24px", background: "linear-gradient(135deg, rgba(255,253,249,0.9), rgba(251,245,236,0.7))", borderRadius: 10, border: "1px solid #e3d5bf", boxShadow: "0 4px 20px rgba(64,52,32,0.07)" }}><Clock /></div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.08s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Watchlist<Info text="Live market prices grouped by signal: indices (SPY, QQQ, IWM), mega-cap movers (NVDA, AAPL, MSFT, JPM, TSLA), and macro indicators (TLT for rates, GLD for risk-off, UUP for dollar). Click any ticker for TradingView. Source: Finnhub.io" />{apiKey && <Info text={"Signal cheat sheet: TLT drops + SPY flat \u2192 rates rising, deal flow slows. GLD + TLT both spike \u2192 risk-off, market scared. IWM diverges from SPY \u2192 small-cap sentiment shifting (PE pipeline signal). QQQ outpaces SPY \u2192 growth/tech rotation. JPM moves on earnings \u2192 read-through on credit conditions and IB deal activity. UUP rising \u2192 dollar strengthening, pressure on international deals and EM. NVDA guidance \u2192 AI capex cycle indicator, affects entire tech sector. TLT rising + SPY rising \u2192 goldilocks (rates falling, equities up)."} linkLabel="TradingView" link="https://www.tradingview.com" />}{!pricesLive && <span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>DEMO DATA</span>}</h2>
            <p style={{ fontSize: 11, color: "#8a8072", fontStyle: "italic", margin: "-6px 0 10px" }}>The names I track daily.</p>
            {prices.map(t => <a key={t.symbol} href={`https://www.tradingview.com/symbols/${t.symbol}/`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 10, transition: "all 0.2s", cursor: "pointer", borderLeft: "2px solid transparent", textDecoration: "none" }} onMouseEnter={e => {e.currentTarget.style.background = "rgba(13,109,86,0.04)"; e.currentTarget.style.borderLeftColor = "#0d6d5650";}} onMouseLeave={e => {e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent";}}>
              <div><span style={{ color: "#33302c", fontWeight: 600, fontSize: 13 }}>{t.symbol}</span><span style={{ color: "#8a8072", fontSize: 11, marginLeft: 8 }}>{t.name}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Spark pos={parseFloat(t.change) >= 0} /><span style={{ color: "#33302c", fontFamily: "JetBrains Mono, monospace", fontSize: 13, minWidth: 60, textAlign: "right" }}>${t.price}</span><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, minWidth: 58, textAlign: "right", color: parseFloat(t.change) >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{parseFloat(t.change) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(t.change)).toFixed(2)}%</span></div>
            </a>)}
          </section>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.12s both" }}>
              <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Quick Links<Info text="One-click access to essential finance platforms — Bloomberg, Reuters, EDGAR, TradingView, and more." /></h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{QLINKS.map(s => <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer" style={{...S.chip, boxShadow: "0 2px 6px rgba(64,52,32,0.05)"}} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5640"; e.currentTarget.style.color = "#0d6d56"; e.currentTarget.style.background = "rgba(13,109,86,0.06)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(13,109,86,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e9ddc9"; e.currentTarget.style.color = "#6f675c"; e.currentTarget.style.background = "rgba(255,253,249,0.85)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(64,52,32,0.05)"; e.currentTarget.style.transform = "none"; }}>{s.n}</a>)}</div>
            </section>
            <div style={{ animation: "fadeUp 0.5s ease 0.16s both" }}><Notes /></div>
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.2s both" }}><h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Sector Heatmap<Info text="Visual map of sector performance by GICS sector. Size reflects relative market cap weight. Green = positive, red = negative, yellow = flat. Click any ticker to open TradingView. Source: Finnhub.io real-time quotes (5-min cache)." link="https://www.investopedia.com/terms/s/sector-analysis.asp" linkLabel="Sector rotation & analysis" />{!pricesLive && <span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>DEMO DATA</span>}</h2><HeatMap finnhubKey={finnhubKey} /></section>
          <RegimeIndicator apiKey={apiKey} />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <EarningsCal apiKey={apiKey} />
          <EconCalendar apiKey={apiKey} />
        </div>
        <div style={{ ...S.card, animation: "fadeUp 0.5s ease 0.4s both" }}>
          <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Portfolio Allocation<Info text="Sample asset allocation by weight — illustrative, not investment advice. Hover the donut to see individual holdings." link="https://www.investopedia.com/terms/a/assetallocation.asp" linkLabel="Asset allocation basics" /><span style={{ marginLeft: "auto", fontSize: 8, padding: "3px 8px", borderRadius: 8, background: "rgba(176,116,30,0.08)", color: "#b0741e", border: "1px solid rgba(176,116,30,0.25)", letterSpacing: 1 }}>SAMPLE</span></h2>
          <div className="portfolio-layout" style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}><Donut data={PORTFOLIO} size={200} /><div style={{ flex: 1, minWidth: 300 }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Ticker", "Name", "Type", "Weight"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", borderBottom: "1px solid #e9ddc9" }}>{h}</th>)}</tr></thead><tbody>{PORTFOLIO.map(p => <tr key={p.ticker} style={{ borderBottom: "1px solid #e9ddc910" }} onMouseEnter={e => e.currentTarget.style.background = "#e9ddc910"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><td style={{ padding: "12px", fontSize: 13, color: "#0d6d56", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{p.ticker}</td><td style={{ padding: "12px", fontSize: 13, color: "#6f675c" }}>{p.name}</td><td style={{ padding: "12px" }}><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: p.type === "ETF" ? "#1f5a9e10" : p.type === "Crypto" ? "#b0741e10" : "#0d6d5610", color: p.type === "ETF" ? "#1f5a9e" : p.type === "Crypto" ? "#b0741e" : "#0d6d56" }}>{p.type}</span></td><td style={{ padding: "12px", fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#6f675c" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 80, height: 4, background: "#f6eee1", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${p.weight * 3.3}%`, height: "100%", background: "linear-gradient(90deg,#0d6d56,#1f5a9e)", borderRadius: 2 }} /></div>{p.weight}%</div></td></tr>)}</tbody></table></div></div>
        </div>
      </div>}

      {tab === "news" && <div style={{ animation: "fadeUp 0.4s ease both" }}><Kicker n="04" t="News & Briefings" /><NewsFeed apiKey={apiKey} /></div>}

      {tab === "projects" && <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <Kicker n="02" t="Selected Work" />
        <h1 style={S.pageTitle}>Projects</h1><p style={{ color: "#6f675c", marginBottom: 32, fontSize: 14 }}>Graduate coursework and independent builds — financial modeling, econometrics, and quantitative analysis.</p>
        <div style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#33302c" }}>◆</span> Deal Sheet<span style={{ marginLeft: "auto", fontSize: 8, color: "#a2977f", letterSpacing: 1 }}>STUDENT RECONSTRUCTIONS OF REAL TRANSACTIONS</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(230px,100%),1fr))", gap: 14 }}>
            {DEALS.map(d => <div key={d.co} id={d.id} style={{ border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: -5, borderRadius: 2, padding: "30px 18px 20px", textAlign: "center", background: "#fffdf9", display: "flex", flexDirection: "column" }}>
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
                </span>
                <CopyAnchor tab="projects" id={d.id} />
              </div>
            </div>)}
          </div>
        </div>
        <div id="lbo-sandbox" style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Interactive — Mini LBO Model<Info text="A simplified leveraged-buyout model you can play with. Set the entry price, leverage, growth, and exit assumptions — the sponsor returns and value-creation bridge update live. Built in React to demonstrate the mechanics behind the deal reconstructions above." /><span style={{ marginLeft: "auto" }}><CopyAnchor tab="projects" id="lbo-sandbox" /></span></h2>
          <LBOSandbox />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(360px,100%),1fr))", gap: 14 }}>{PROJECTS.map((p, i) => <div key={i} style={{ ...S.pCard, ...(hovP === i ? { border: "1px solid #0d6d5650", transform: "translateY(-6px) scale(1.01)", boxShadow: "0 20px 50px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.15), 0 0 40px rgba(13,109,86,0.05)" } : {}), animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s` }} onMouseEnter={() => setHovP(i)} onMouseLeave={() => setHovP(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>PROJECT_{String(i + 1).padStart(2, "0")}{p.completed && <span style={{ marginLeft: 8, color: "#a2977f" }}>· {p.completed}</span>}</span><div style={{ display: "flex", alignItems: "center", gap: 6 }}>{p.updated && <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "JetBrains Mono, monospace" }}>Updated {p.updated}</span>}<span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: p.status === "In Progress" ? "#b0741e08" : "#0d6d5608", color: p.status === "In Progress" ? "#b0741e" : "#0d6d56", fontFamily: "JetBrains Mono, monospace" }}>{p.status}</span></div></div>
          {p.img && <img src={p.img} alt={p.title} loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", objectPosition: "top", borderRadius: 10, border: "1px solid #e9ddc9", marginBottom: 14, display: "block", background: "#f6eee1" }} />}
          <h3 style={{ color: "#33302c", fontSize: 17, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
          <p style={{ color: "#6f675c", fontSize: 13, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{p.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: p.url ? 12 : 0 }}>{p.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: "#e9ddc930", color: "#6f675c", fontFamily: "JetBrains Mono, monospace" }}>{t}</span>)}</div>
          {(p.url || p.demo) && <div style={{ display: "flex", gap: 12 }}>
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#1f5a9e", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 10px", background: "#1f5a9e08", border: "1px solid #1f5a9e20", borderRadius: 6, transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#1f5a9e15";e.currentTarget.style.borderColor="#1f5a9e40"}} onMouseLeave={e=>{e.currentTarget.style.background="#1f5a9e08";e.currentTarget.style.borderColor="#1f5a9e20"}}>▶ Live Demo <span style={{fontSize:9}}>↗</span></a>}
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#0d6d56", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 0", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{p.url.includes("github") ? "GitHub" : p.url.includes("paper") ? "View Paper" : "View"} <span style={{fontSize:9}}>↗</span></a>}
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
                  "Info Tech Sector Analyst — Shollmier Investment Fund, a $700K+ student-managed portfolio (2025–26)",
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
        <div className="about-stats" style={{ ...S.card, margin: "14px 0", display: "flex", justifyContent: "space-around", padding: "20px 32px", flexWrap: "wrap", gap: 16 }}>
          {[["Master's GPA", "4.0", "Walton College"], ["Undergrad GPA", "3.62", "Dean's List ×5"], ["Self-Funded", "100%", "of undergrad education"], ["Graduated", "May 2026", "M.S. Finance"]].map(([label, val, sub], i) => (
            <div key={label} style={{ textAlign: "center", padding: "20px 24px", borderRadius: 14, background: "linear-gradient(145deg, #f6eee1, #f6eee1)", border: "1px solid #e3d5bf", flex: "1 1 0", minWidth: 120, boxShadow: "inset 0 2px 10px rgba(64,52,32,0.07), 0 1px 0 rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "#33302c", marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6f675c", fontWeight: 500, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace" }}>{sub}</div>
            </div>
          ))}
        </div>
        <Orn />
        <Reveal><div style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Featured Work</h2>
            <button onClick={() => setTab("projects")} style={{ ...S.btn, fontSize: 10, padding: "5px 14px" }}>All projects →</button>
          </div>
          <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {PROJECTS.filter(p => p.img).map(p => <div key={p.title} style={{ borderRadius: 12, border: "1px solid #e9ddc9", overflow: "hidden", background: "#fffdf9", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer" }} onClick={() => setTab("projects")} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(13,109,86,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <img src={p.img} alt={p.title} loading="lazy" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", objectPosition: "top", display: "block", borderBottom: "1px solid #e9ddc9", background: "#f6eee1" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ color: "#33302c", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                <div style={{ color: "#6f675c", fontSize: 11, lineHeight: 1.5 }}>{p.desc.split(". ")[0].slice(0, 110)}{p.desc.split(". ")[0].length > 110 ? "…" : "."}</div>
              </div>
            </div>)}
          </div>
        </div>
        </Reveal>
        <Reveal><div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Now<span style={{ marginLeft: "auto", fontSize: 8, color: "#a2977f", letterSpacing: 1 }}>UPDATED JUL 2026</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {["Interviewing for analyst roles across investment banking, private equity, wealth management, and corporate finance",
              "Extending the EA / Jagex LBO framework to new hypothetical buyout targets",
              "Preparing for the FINRA SIE — CFA Level I planned next",
              "Reading Damodaran on Valuation and Pignataro's Financial Modeling & Valuation"].map((t, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span style={{ color: "#0d6d56", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>→</span><span style={{ color: "#4a443c", fontSize: 13, lineHeight: 1.6 }}>{t}</span></div>)}
          </div>
        </div>
        </Reveal>
        <Orn />
        <Reveal><div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Timeline</h2>
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
        <Reveal><div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Skills & Tools</h2>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Core Finance</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Financial Modeling", "Valuation (DCF, LBO, Comps)", "Quality of Earnings (QoE)", "Investment Analysis", "Transaction Analysis", "Portfolio Management", "Monte Carlo Simulation", "Econometrics", "Quantitative Research"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))", color: "#0d6d56", border: "1px solid rgba(13,109,86,0.15)", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(13,109,86,0.04)" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(13,109,86,0.12)";e.currentTarget.style.boxShadow="0 4px 12px rgba(13,109,86,0.1)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))";e.currentTarget.style.boxShadow="0 2px 6px rgba(13,109,86,0.04)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Tools</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Excel", "Python", "Bloomberg", "PitchBook", "Stata", "RStudio", "SQL", "PowerPoint", "Streamlit"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", color: "#6f675c", border: "1px solid #e3d5bf", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(64,52,32,0.05)" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1f5a9e40";e.currentTarget.style.color="#1f5a9e";e.currentTarget.style.boxShadow="0 4px 12px rgba(31,90,158,0.08)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.color="#6f675c";e.currentTarget.style.boxShadow="0 2px 6px rgba(64,52,32,0.05)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
          <div><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Certifications & Licenses</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[["Bloomberg Market Concepts", "Certified · Apr 2026 ↗", "#0d6d56", "/bmc-certificate.pdf"], ["FINRA SIE", "In Progress", "#b0741e", null], ["CFA Level I", "Planned", "#8a8072", null]].map(([name, status, c, url]) => { const inner = <>{name}<span style={{ fontSize: 8, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 1, opacity: 0.75 }}>{status}</span></>; const st = { fontSize: 11, padding: "6px 14px", borderRadius: 8, background: `${c}0a`, color: c, border: `1px solid ${c}30`, cursor: url ? "pointer" : "default", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }; return url ? <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={st} title="View certificate">{inner}</a> : <span key={name} style={st}>{inner}</span>; })}
          </div></div>
        </div>
        </Reveal>
        <Orn />
        <Reveal><div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Reading List</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{READING.map((b, i) => <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", border: "1px solid #e3d5bf", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.25s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#b0741e30";e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.transform="none"}}><div><div style={{ color: "#33302c", fontSize: 12, fontWeight: 500 }}>{b.title}</div><div style={{ color: "#8a8072", fontSize: 10 }}>{b.author}</div></div><span style={{ fontSize: 8, padding: "3px 10px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace", background: b.s === "Reading" ? "rgba(31,90,158,0.1)" : b.s === "Done" ? "rgba(13,109,86,0.1)" : "rgba(111,103,92,0.08)", color: b.s === "Reading" ? "#1f5a9e" : b.s === "Done" ? "#0d6d56" : "#6f675c", border: `1px solid ${b.s === "Reading" ? "rgba(31,90,158,0.2)" : b.s === "Done" ? "rgba(13,109,86,0.2)" : "rgba(111,103,92,0.15)"}` }}>{b.s === "Done" ? "Completed" : b.s === "Ref" ? "Reference" : b.s}</span></div>)}</div>
          </div>
          <div style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b3551d" }}>◆</span> Currently Exploring</h2>
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
        <Reveal><div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#33302c" }}>◆</span> Work Index<span style={{ marginLeft: "auto", fontSize: 8, color: "#a2977f", letterSpacing: 1 }}>EVERYTHING, ONE LIST</span></h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ARTIFACTS.map((a, i) => <div key={a.label} style={{ borderTop: i === 0 ? "none" : "1px solid #efe4d2" }}>
              {a.href
                ? <a href={a.href} target={a.href.startsWith("/") ? "_self" : "_blank"} rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "9px 2px", fontSize: 12.5, color: "#33302c", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, flexShrink: 0 }}>↗</span></a>
                : <button onClick={() => goAnchor(a.tab, a.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "9px 2px", fontSize: 12.5, color: "#33302c", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#33302c"}>{a.label}<span style={{ color: "#0d6d56", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, flexShrink: 0 }}>→</span></button>}
            </div>)}
          </div>
        </div></Reveal>
        <Reveal><div style={S.card}>
          <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Connect</h2>
          <div className="connect-links" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{LINKS.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", color: "#33302c", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e3d5bf", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 12px rgba(64,52,32,0.07)", flex: "1 1 0", justifyContent: "center", minWidth: 140 }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5650"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e3d5bf"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(64,52,32,0.07)"; }}><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "#0d6d56" }}>{l.ic}</span>{l.label}</a>)}</div>
        </div></Reveal>
      </div>}

      {tab === "recruiter" && <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "14px 0 30px" }}>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#0d6d56", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Recruiter Packet — Everything on One Screen</div>
        <img src="/headshot.jpg" alt="Mason J. Bennett" style={{ width: 104, height: 104, borderRadius: 8, objectFit: "cover", objectPosition: "center 15%", border: "1px solid #33302c", outline: "1px solid #33302c", outlineOffset: 3, margin: "0 auto 18px", display: "block", filter: "grayscale(0.18) sepia(0.1) contrast(1.05)" }} />
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 34, fontWeight: 400, color: "#262421", marginBottom: 6, lineHeight: 1 }}>Mason J. Bennett</h1>
        <p style={{ color: "#0d6d56", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", marginBottom: 20 }}>M.S. Finance · University of Arkansas · Dallas–Fort Worth, TX</p>
        <div style={{ borderTop: "1px solid #e9ddc9", borderBottom: "1px solid #e9ddc9", padding: "14px 0", marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {["4.0 GPA — M.S. Finance, Walton College of Business (May 2026)", "Info Tech Sector Analyst — Shollmier Investment Fund ($700K+, 2025–26)", "Bloomberg Market Concepts certified · FINRA SIE in progress"].map(s => <div key={s} style={{ fontSize: 13, color: "#33302c", fontWeight: 500 }}>{s}</div>)}
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
      </div>
      <div style={{ color: "#a2977f", fontSize: 9, fontFamily: "JetBrains Mono, monospace", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <span>Mason J. Bennett</span><span>·</span><span>M.S. Finance, Walton College</span><span>·</span><span>© {new Date().getFullYear()}</span><span>·</span><span>⌘K or 1-4</span>
      </div>
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
      body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;font-variant-numeric:tabular-nums}
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
