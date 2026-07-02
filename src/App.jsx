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
  { title: "LBO Analysis & Pitch Deck — Electronic Arts", desc: "Public-to-private leveraged buyout model for EA. Full debt scheduling with senior/sub tranches, sponsor returns analysis across multiple exit multiples, and sensitivity tables for IRR/MOIC. Includes investment committee pitch deck with market overview, deal rationale, and operating improvements.", tags: ["LBO", "Private Equity", "Excel", "Pitch Deck"], status: "Completed", completed: "May 2026" },
  { title: "LBO Analysis & Pitch Deck — Jagex", desc: "Private-to-private leveraged buyout model for Jagex (RuneScape). More complex capital structure with existing sponsor exit dynamics, management rollover, and limited public financial data. Full debt scheduling, returns analysis, and IC pitch deck with gaming industry thesis.", tags: ["LBO", "Private Equity", "Excel", "Secondary Buyout"], status: "Completed", completed: "May 2026" },
  { title: "Personal Budgeting App", desc: "Full-stack personal finance tool with 11 modules: income & tax estimation (all 50 states, 2026 IRS brackets), 50/30/20 budget builder, expense tracking with CSV import and recurring templates, net worth monitoring, debt payoff planner (avalanche vs snowball), savings goals, investment projector with 401(k) career match calculator, FIRE calculator, and tax optimizer. Month-over-month dashboard with historical navigation.", tags: ["Python", "Streamlit", "Personal Finance", "Tax Planning"], status: "Completed", completed: "Apr 2026", updated: "Apr 12, 2026", url: "https://github.com/masonjbennett/budgeting-app", demo: "https://masonbennett-budget.streamlit.app/" },
  { title: "Portfolio Analytics App", desc: "Real-time equity portfolio construction and optimization tool with 6 analytical modules. Mean-variance optimization (GMV & Tangency), efficient frontier with CAL, CAPM beta/alpha regression, risk contribution decomposition (PRC), and estimation window sensitivity analysis. Features a tiered tooltip system (Beginner/Intermediate/Advanced) that adapts explanations to the user's knowledge level, custom portfolio builder with live frontier plotting, and CSV/Excel export.", tags: ["Python", "Streamlit", "Portfolio Optimization", "scipy"], status: "Completed", completed: "Apr 2026", updated: "Apr 11, 2026", url: "https://github.com/masonjbennett/portfolio-app", demo: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { title: "Applied Econometrics — Hurricane Michael", desc: "Regression analysis studying Hurricane Michael's impact on Florida housing prices across 67 counties. Built MLR and Difference-in-Difference models achieving R² of 0.59, identifying a $36,631 median price decline in affected counties. Analyzed median income, unemployment, elevation, FEMA risk indices, and population density as determinants.", tags: ["Stata", "Econometrics", "Regression Analysis", "Diff-in-Diff"], status: "Completed", completed: "Apr 2024", url: "/hurricane-paper.docx" },
];
const EXPERIENCE = [
  { role: "M.S. Finance", org: "Walton College of Business", date: "2025–2026", type: "edu", detail: "4.0 GPA · Advanced Financial Modeling, Investments, Investment Theory, Data Analytics, Shollmier Project" },
  { role: "B.S. Business Administration", org: "Walton College of Business", date: "2021–2024", type: "edu", detail: "3.62 GPA · Business Economics · Dean's List (Fall '21, '22, '23, Spring '24)" },
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
  { label: "Email", url: "mailto:masonjbennett@aol.com", ic: "✉" },
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

// Sample investment theses (user editable)
const INIT_THESES = [
  { id: 1, company: "NVDA", name: "NVIDIA Corp.", stance: "Bull", thesis: "AI infrastructure spending is in early innings. Data center revenue is accelerating with hyperscaler capex cycles, and NVIDIA maintains 80%+ GPU market share for AI training workloads.", catalyst: "Upcoming earnings beat driven by Blackwell architecture ramp", risk: "Customer concentration in top 4 hyperscalers; potential ASP compression from AMD MI300X competition", timeframe: "12–18 months", date: "Apr 2026" },
  { id: 2, company: "JPM", name: "JP Morgan Chase", stance: "Bull", thesis: "Best-positioned money center bank for a higher-for-longer rate environment. Net interest income benefits from steeper curve, trading revenues resilient, and investment banking pipeline recovering.", catalyst: "IB revenue recovery as M&A cycle picks up in 2026", risk: "Credit quality deterioration in commercial real estate; regulatory capital requirements", timeframe: "6–12 months", date: "Apr 2026" },
];

const INIT_COMMENTARY = [
  { id: 1, date: "Apr 7, 2026", title: "Tariff Uncertainty Weighing on Multiples", content: "Markets continue to price in policy uncertainty as trade rhetoric escalates. The VIX has stayed elevated above 20 for two consecutive weeks — unusual for a period without an earnings shock. I'm watching the 10Y closely as a signal: if yields break below 4.0%, it likely means the bond market is pricing recession risk over inflation, which would be a regime shift worth repositioning for. Staying overweight quality names with pricing power (MSFT, AAPL) and underweight cyclicals until clarity emerges." },
  { id: 2, date: "Mar 31, 2026", title: "Q1 Earnings Preview — Tech Will Set the Tone", content: "Heading into Q1 earnings with elevated expectations for Big Tech. The Mag 7 are expected to grow earnings ~18% YoY on average, but the bar has been raised. Key question: are hyperscaler capex plans for AI infrastructure sustainable at current run rates, or do we see a deceleration signal? NVDA guidance will be the most important single data point of earnings season. If Blackwell ramp disappoints, expect a broad AI trade unwind." },
];

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
  // Fallback: simulated if no key
  useEffect(() => {
    if (finnhubKey) return;
    setP(tickers.map(t => ({ ...t, price: (80 + Math.random() * 450).toFixed(2), change: (Math.random() * 7 - 3.5).toFixed(2) })));
    const iv = setInterval(() => setP(prev => prev.map(t => { const d = (Math.random() - 0.47) * 1.8; return { ...t, price: Math.max(1, parseFloat(t.price) + d).toFixed(2), change: (parseFloat(t.change) + d * 0.08).toFixed(2) }; })), 3000);
    return () => clearInterval(iv);
  }, [finnhubKey]);
  return p;
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

// ============ SMALL COMPONENTS ============
function Spark({ pos, w = 88, h = 28 }) { const id = useRef(`s${Math.random().toString(36).slice(2,6)}`); const glow = useRef(`g${Math.random().toString(36).slice(2,6)}`); const pts = useRef(Array.from({length:22},(_,i)=>{const x=(i/21)*w,y=h/2+(pos?-1:1)*i*0.35+(Math.random()-0.5)*h*0.45;return`${x},${Math.max(2,Math.min(h-2,y))}`;}).join(" ")); return <svg width={w} height={h} style={{display:"block",filter:`drop-shadow(0 0 4px ${pos?"rgba(13,109,86,0.3)":"rgba(178,52,43,0.3)"})`}}><defs><linearGradient id={id.current} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={pos?"#0d6d56":"#b2342b"} stopOpacity="0.25"/><stop offset="100%" stopColor={pos?"#0d6d56":"#b2342b"} stopOpacity="0"/></linearGradient></defs><polyline points={pts.current+` ${w},${h} 0,${h}`} fill={`url(#${id.current})`}/><polyline points={pts.current} fill="none" stroke={pos?"#0d6d56":"#b2342b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function Donut({ data, size = 200 }) { const [hov,setHov]=useState(null); const total=data.reduce((s,d)=>s+d.weight,0),C=["#0d6d56","#1f5a9e","#6d549e","#990f3d","#b0741e","#b3551d","#6f675c"]; let cum=-90; return <svg viewBox="0 0 200 200" width={size} height={size} style={{filter:"drop-shadow(0 4px 24px rgba(13,109,86,0.12)) drop-shadow(0 0 40px rgba(13,109,86,0.04))"}}>{data.map((d,i)=>{const a=(d.weight/total)*360,s=cum;cum+=a;const r=hov===i?84:80,rd=v=>(v*Math.PI)/180;const x1=100+r*Math.cos(rd(s)),y1=100+r*Math.sin(rd(s)),x2=100+r*Math.cos(rd(cum)),y2=100+r*Math.sin(rd(cum));return <path key={i} d={`M100,100 L${x1},${y1} A${r},${r} 0 ${a>180?1:0},1 ${x2},${y2} Z`} fill={C[i%C.length]} stroke="#f6eee1" strokeWidth="2.5" style={{transition:"all 0.25s",cursor:"pointer",filter:hov===i?`drop-shadow(0 0 8px ${C[i%C.length]}50)`:"none"}} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>})}<circle cx="100" cy="100" r="50" fill="#f6eee1"/>{hov!==null?<><text x="100" y="95" textAnchor="middle" fill={C[hov%C.length]} fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">{data[hov].ticker}</text><text x="100" y="113" textAnchor="middle" fill="#6f675c" fontSize="10" fontFamily="JetBrains Mono">{data[hov].weight}%</text></>:<><text x="100" y="95" textAnchor="middle" fill="#33302c" fontSize="12" fontFamily="JetBrains Mono">Portfolio</text><text x="100" y="113" textAnchor="middle" fill="#8a8072" fontSize="9" fontFamily="JetBrains Mono">{data.length} holdings</text></>}</svg>; }
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
  const gc=c=>{const v=parseFloat(c);return v>3?"#15803d":v>1?"#1a9464":v>-1?"#6f675c":v>-3?"#b2342b":"#992d25"};
  return <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{cells.map(c=><a key={c.ticker} href={`https://www.tradingview.com/symbols/${c.ticker}/`} target="_blank" rel="noopener noreferrer" style={{background:gc(c.change)+"15",border:`1px solid ${gc(c.change)}30`,borderRadius:10,padding:"12px 0",flex:`${c.w} 1 0`,minWidth:70,textAlign:"center",cursor:"pointer",transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 2px 8px ${gc(c.change)}08`,textDecoration:"none"}} onMouseEnter={e=>{e.currentTarget.style.background=gc(c.change)+"30";e.currentTarget.style.transform="scale(1.05) translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 20px ${gc(c.change)}15`}} onMouseLeave={e=>{e.currentTarget.style.background=gc(c.change)+"15";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 2px 8px ${gc(c.change)}08`}}><div style={{fontSize:12,fontWeight:700,color:"#33302c",fontFamily:"'JetBrains Mono',monospace"}}>{c.ticker}</div><div style={{fontSize:11,color:gc(c.change),fontFamily:"'JetBrains Mono',monospace",marginTop:2,fontWeight:600}}>{parseFloat(c.change)>0?"+":""}{c.change}%</div><div style={{fontSize:8,color:"#8a8072",marginTop:3}}>{c.sector}</div></a>)}</div>;
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
function Hero(){const[ph,setPh]=useState(0);useEffect(()=>{const timers=[setTimeout(()=>setPh(1),350),setTimeout(()=>setPh(2),1000),setTimeout(()=>setPh(3),1800),setTimeout(()=>setPh(4),2600)];return()=>timers.forEach(clearTimeout)},[]);return <div style={{position:"fixed",inset:0,background:"#faf3ea",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 1s ease",opacity:ph>=4?0:1,pointerEvents:ph>=4?"none":"all"}} onClick={()=>setPh(4)}><div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(13,109,86,0.06) 0%,transparent 70%)",animation:"breathe 4s ease-in-out infinite"}}/><div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(31,90,158,0.04) 0%,transparent 70%)",animation:"breathe 5s ease-in-out infinite",animationDelay:"1s",left:"35%",top:"55%"}}/><div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg, transparent, rgba(13,109,86,0.3), transparent)",opacity:ph>=1?1:0,transition:"opacity 1s"}} /><div style={{position:"relative",textAlign:"center"}}><div style={{fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#0d6d56",letterSpacing:8,textTransform:"uppercase",marginBottom:28,opacity:ph>=1?1:0,transform:`translateY(${ph>=1?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)"}}>masonjbennett.com</div><h1 className="hero-name" style={{fontSize:72,fontWeight:700,fontFamily:"'Instrument Serif',serif",color:"#262421",lineHeight:1,marginBottom:18,opacity:ph>=2?1:0,transform:`translateY(${ph>=2?0:20}px) scale(${ph>=2?1:0.95})`,transition:"all 1s cubic-bezier(0.4,0,0.2,1)",letterSpacing:"-0.02em"}}>Mason J. Bennett</h1><p className="hero-sub" style={{fontSize:15,color:"#6f675c",letterSpacing:2,opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1)",fontFamily:"'Space Grotesk',sans-serif"}}>M.S. Finance '26 · University of Arkansas · Investment Banking & Private Equity</p><div style={{display:"flex",gap:16,marginTop:32,justifyContent:"center",opacity:ph>=3?1:0,transform:`translateY(${ph>=3?0:10}px)`,transition:"all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s"}}>{["IB","PE","TA"].map(t=><span key={t} style={{fontSize:10,padding:"4px 14px",borderRadius:20,border:"1px solid rgba(13,109,86,0.2)",color:"#0d6d56",fontFamily:"'JetBrains Mono',monospace",letterSpacing:2,background:"rgba(13,109,86,0.05)"}}>{t}</span>)}</div></div><div style={{position:"absolute",bottom:36,fontSize:9,color:"#a2977f",fontFamily:"'JetBrains Mono',monospace",letterSpacing:3,textTransform:"uppercase",opacity:ph>=1&&ph<4?0.8:0,transition:"opacity 1.2s"}}>click anywhere to skip</div></div>;}
function Cmd({open,onClose,onNav}){const[q,setQ]=useState("");const ref=useRef();const items=[{l:"Dashboard",t:"dashboard"},{l:"About",t:"about"},{l:"Projects",t:"projects"},{l:"Research",t:"research"},{l:"Portfolio",t:"portfolio"},{l:"News",t:"news"},...QLINKS.map(l=>({l:l.n,u:l.u}))];const f=items.filter(i=>i.l.toLowerCase().includes(q.toLowerCase()));useEffect(()=>{if(open&&ref.current){ref.current.focus();setQ("")}},[open]);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(51,48,46,0.45)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:100,animation:"fadeIn 0.15s"}} onClick={onClose}><div style={{background:"#fffdf9",border:"1px solid #d8c8b0",borderRadius:16,width:520,overflow:"hidden",boxShadow:"0 32px 80px rgba(64,52,32,0.14)"}} onClick={e=>e.stopPropagation()} className="cmd-modal"><div style={{padding:"16px 20px",borderBottom:"1px solid #e9ddc9",display:"flex",alignItems:"center",gap:12}}><span style={{color:"#0d6d56"}}>⌘</span><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{flex:1,background:"none",border:"none",outline:"none",color:"#33302c",fontSize:15}}/><kbd style={{fontSize:9,padding:"2px 7px",borderRadius:4,background:"#e9ddc9",color:"#8a8072",border:"1px solid #d8c8b0",fontFamily:"'JetBrains Mono',monospace"}}>ESC</kbd></div><div style={{maxHeight:320,overflowY:"auto",padding:6}}>{f.map((item,i)=><button key={i} onClick={()=>{if(item.t)onNav(item.t);else window.open(item.u,"_blank");onClose()}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",background:"none",border:"none",color:"#33302c",fontSize:14,cursor:"pointer",borderRadius:10,textAlign:"left",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#e9ddc9"} onMouseLeave={e=>e.currentTarget.style.background="none"}><span style={{color:"#0d6d56",width:20,textAlign:"center"}}>→</span><span>{item.l}</span>{item.u&&<span style={{marginLeft:"auto",fontSize:10,color:"#8a8072"}}>↗</span>}</button>)}</div></div></div>;}

// ============ BRIEFINGS (compact) ============
function Briefings({apiKey}){const[morning,setMorning]=useState(null),[close,setClose]=useState(null),[vM,setVM]=useState(null),[vC,setVC]=useState(null),[swM,setSwM]=useState(null),[swC,setSwC]=useState(null),[lM,setLM]=useState(false),[lC,setLC]=useState(false),[vLM,setVLM]=useState(false),[vLC,setVLC]=useState(false),[swLM,setSwLM]=useState(false),[swLC,setSwLC]=useState(false),[tM,setTM]=useState(null),[tC,setTC]=useState(null),[showCl,setShowCl]=useState(false),[showSW,setShowSW]=useState(true),[tab,setTab]=useState(()=>new Date().getHours()>=16?"close":"morning");const sugg=new Date().getHours()>=16?"close":"morning";
const gen=async(type,force=false)=>{if(!apiKey)return;const sL=type==="morning"?setLM:setLC,sD=type==="morning"?setMorning:setClose,sT=type==="morning"?setTM:setTC,sV=type==="morning"?setVM:setVC,sSW=type==="morning"?setSwM:setSwC,sVL=type==="morning"?setVLM:setVLC,sSWL=type==="morning"?setSwLM:setSwLC;sL(true);sV(null);sSW(null);const r=await fetchBriefing(type,apiKey,force);if(r){sD(r);sT(new Date())}sL(false);if(r?.text){sVL(true);const v=await verifyBriefing(r.text,apiKey);if(v)sV(v);sVL(false);sSWL(true);const sw=await fetchSoWhat(r.text,type,apiKey);if(sw)sSW(sw);sSWL(false)}};
const data=tab==="morning"?morning:close,loading=tab==="morning"?lM:lC,verifying=tab==="morning"?vLM:vLC,verify=tab==="morning"?vM:vC,soWhat=tab==="morning"?swM:swC,swLoad=tab==="morning"?swLM:swLC,time=tab==="morning"?tM:tC;
const SC={verified:"#0d6d56",minor_discrepancy:"#b0741e",unverified:"#b2342b"},SI={verified:"✓",minor_discrepancy:"~",unverified:"✗"},SL={verified:"Verified",minor_discrepancy:"Discrepancy",unverified:"Unverified"};
return <div style={{...S.card,background:"linear-gradient(135deg,#f6eee1,#fdf8f0,#f6eee1)",border:"1px solid rgba(13,109,86,0.1)",boxShadow:"0 12px 48px rgba(64,52,32,0.1), 0 0 40px rgba(13,109,86,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:`radial-gradient(circle,${tab==="morning"?"rgba(176,116,30,0.03)":"rgba(90,95,184,0.05)"} 0%,transparent 70%)`,pointerEvents:"none"}}/>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,position:"relative",flexWrap:"wrap",gap:12}}><div><div style={{display:"flex",gap:6,marginBottom:8}}>{["morning","close"].map(t=><button key={t} onClick={()=>setTab(t)} style={{fontSize:12,padding:"6px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,transition:"all 0.25s",border:"1px solid",display:"flex",alignItems:"center",gap:8,background:tab===t?(t==="morning"?"#b0741e10":"#56599e10"):"transparent",borderColor:tab===t?(t==="morning"?"#b0741e30":"#56599e30"):"#e9ddc9",color:tab===t?(t==="morning"?"#b0741e":"#56599e"):"#8a8072"}}><span style={{fontSize:15}}>{t==="morning"?"☀":"🌙"}</span>{t==="morning"?"Morning":"Close"} Brief{sugg===t&&<span style={{width:5,height:5,borderRadius:3,background:t==="morning"?"#b0741e":"#56599e",animation:"pulse 2s infinite"}}/>}</button>)}</div><p style={{color:"#8a8072",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>AI briefing → fact-check → implications {time?`· ${time.toLocaleTimeString()}`:""}</p></div><button onClick={()=>gen(tab,!!data)} disabled={loading||verifying} style={{...S.btn,opacity:(loading||verifying)?0.5:1}}>{loading?"⟳ Generating...":verifying||swLoad?"⟳ Analyzing...":data?"↻ Regenerate":"Generate Brief"}</button></div>
{!data&&!loading&&<div style={{textAlign:"center",padding:"36px 0"}}><div style={{fontSize:36,marginBottom:12,opacity:0.15}}>{tab==="morning"?"☀":"🌙"}</div><p style={{color:"#6f675c",fontSize:13}}>{tab==="morning"?"Pre-market briefing with overnight futures, macro, and what to watch":"End-of-day summary with closes, movers, and tomorrow's catalysts"}</p></div>}
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

// ============ RESEARCH TAB ============
function ResearchTab() {
  const [theses, setTheses] = useState(() => { try { const s = localStorage.getItem("mb_theses"); return s ? JSON.parse(s) : INIT_THESES; } catch { return INIT_THESES; } });
  const [commentary, setCommentary] = useState(() => { try { const s = localStorage.getItem("mb_commentary"); return s ? JSON.parse(s) : INIT_COMMENTARY; } catch { return INIT_COMMENTARY; } });
  useEffect(() => { localStorage.setItem("mb_theses", JSON.stringify(theses)); }, [theses]);
  useEffect(() => { localStorage.setItem("mb_commentary", JSON.stringify(commentary)); }, [commentary]);
  const [showThesisForm, setShowThesisForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newThesis, setNewThesis] = useState({ company: "", name: "", stance: "Bull", thesis: "", catalyst: "", risk: "", timeframe: "" });
  const [newComment, setNewComment] = useState({ title: "", content: "" });
  const [expandedThesis, setExpandedThesis] = useState(null);

  const addThesis = () => { if (!newThesis.company || !newThesis.thesis) return; setTheses(p => [{ ...newThesis, id: Date.now(), date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }) }, ...p]); setNewThesis({ company: "", name: "", stance: "Bull", thesis: "", catalyst: "", risk: "", timeframe: "" }); setShowThesisForm(false); };
  const addComment = () => { if (!newComment.title || !newComment.content) return; setCommentary(p => [{ ...newComment, id: Date.now(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...p]); setNewComment({ title: "", content: "" }); setShowCommentForm(false); };

  return <div style={{ animation: "fadeUp 0.4s ease both" }}>
    <h1 style={S.pageTitle}>Research</h1>
    <p style={{ color: "#6f675c", marginBottom: 28, fontSize: 14 }}>Investment theses, market views, and ongoing analysis.</p>

    {/* Investment Thesis Board */}
    <div style={{ ...S.card, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Investment Thesis Board<Info text="Structured investment write-ups with bull/bear stance, catalysts, and risks. Click any thesis to expand details. Add new theses with the + button." /></h2>
        <button onClick={() => setShowThesisForm(!showThesisForm)} style={{ ...S.btn, fontSize: 11 }}>{showThesisForm ? "Cancel" : "+ New Thesis"}</button>
      </div>

      {showThesisForm && <div style={{ padding: 16, borderRadius: 10, background: "#f6eee1", border: "1px solid #e9ddc9", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          <input value={newThesis.company} onChange={e => setNewThesis(p => ({ ...p, company: e.target.value }))} placeholder="Ticker (e.g. AAPL)" style={S.input} />
          <input value={newThesis.name} onChange={e => setNewThesis(p => ({ ...p, name: e.target.value }))} placeholder="Company Name" style={S.input} />
          <select value={newThesis.stance} onChange={e => setNewThesis(p => ({ ...p, stance: e.target.value }))} style={{ ...S.input, cursor: "pointer" }}><option>Bull</option><option>Bear</option><option>Neutral</option></select>
          <input value={newThesis.timeframe} onChange={e => setNewThesis(p => ({ ...p, timeframe: e.target.value }))} placeholder="Timeframe" style={S.input} />
        </div>
        <textarea value={newThesis.thesis} onChange={e => setNewThesis(p => ({ ...p, thesis: e.target.value }))} placeholder="Core thesis — why are you bullish or bearish?" style={{ ...S.input, minHeight: 70, resize: "vertical" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input value={newThesis.catalyst} onChange={e => setNewThesis(p => ({ ...p, catalyst: e.target.value }))} placeholder="Key catalyst" style={S.input} />
          <input value={newThesis.risk} onChange={e => setNewThesis(p => ({ ...p, risk: e.target.value }))} placeholder="Primary risk" style={S.input} />
        </div>
        <button onClick={addThesis} style={{ ...S.btn, alignSelf: "flex-end", padding: "8px 24px" }}>Save Thesis</button>
      </div>}

      {theses.map((t, i) => <div key={t.id} style={{ padding: "16px 18px", borderRadius: 10, background: "#f6eee1", border: "1px solid #e9ddc9", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }} onClick={() => setExpandedThesis(expandedThesis === t.id ? null : t.id)}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#e9ddc980"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e9ddc9"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expandedThesis === t.id ? 12 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 16, color: "#33302c" }}>{t.company}</span>
            <span style={{ color: "#6f675c", fontSize: 13 }}>{t.name}</span>
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, background: t.stance === "Bull" ? "#0d6d5610" : t.stance === "Bear" ? "#b2342b10" : "#b0741e10", color: t.stance === "Bull" ? "#0d6d56" : t.stance === "Bear" ? "#b2342b" : "#b0741e", border: `1px solid ${t.stance === "Bull" ? "#0d6d5620" : t.stance === "Bear" ? "#b2342b20" : "#b0741e20"}` }}>{t.stance}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {t.timeframe && <span style={{ fontSize: 10, color: "#8a8072", fontFamily: "JetBrains Mono, monospace" }}>{t.timeframe}</span>}
            <span style={{ fontSize: 10, color: "#8a8072", fontFamily: "JetBrains Mono, monospace" }}>{t.date}</span>
            <span style={{ color: "#8a8072", fontSize: 12 }}>{expandedThesis === t.id ? "▾" : "▸"}</span>
          </div>
        </div>
        {expandedThesis === t.id && <div style={{ animation: "fadeUp 0.2s ease" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Thesis</div>
            <p style={{ color: "#4a443c", fontSize: 13, lineHeight: 1.7 }}>{t.thesis}</p>
          </div>
          {t.catalyst && <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: "#0d6d56", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>Catalyst</div>
            <p style={{ color: "#4a443c", fontSize: 12, lineHeight: 1.5 }}>{t.catalyst}</p>
          </div>}
          {t.risk && <div>
            <div style={{ fontSize: 9, color: "#b2342b", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>Risk</div>
            <p style={{ color: "#4a443c", fontSize: 12, lineHeight: 1.5 }}>{t.risk}</p>
          </div>}
        </div>}
      </div>)}
    </div>

    {/* Weekly Commentary */}
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Weekly Market Commentary<Info text="Personal market journal — macro views, sector analysis, and trade ideas. Entries are date-stamped and persist in browser storage." /></h2>
        <button onClick={() => setShowCommentForm(!showCommentForm)} style={{ ...S.btn, fontSize: 11 }}>{showCommentForm ? "Cancel" : "+ New Entry"}</button>
      </div>

      {showCommentForm && <div style={{ padding: 16, borderRadius: 10, background: "#f6eee1", border: "1px solid #e9ddc9", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={newComment.title} onChange={e => setNewComment(p => ({ ...p, title: e.target.value }))} placeholder="Commentary title (e.g. 'Fed Pause Creates Opportunity in Duration')" style={S.input} />
        <textarea value={newComment.content} onChange={e => setNewComment(p => ({ ...p, content: e.target.value }))} placeholder="Write your market view, thesis, analysis..." style={{ ...S.input, minHeight: 120, resize: "vertical", lineHeight: 1.7 }} />
        <button onClick={addComment} style={{ ...S.btn, alignSelf: "flex-end", padding: "8px 24px" }}>Publish</button>
      </div>}

      {commentary.map(c => <div key={c.id} style={{ padding: "16px 18px", borderRadius: 10, background: "#f6eee1", border: "1px solid #e9ddc9", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <h3 style={{ color: "#33302c", fontSize: 15, fontWeight: 600 }}>{c.title}</h3>
          <span style={{ color: "#8a8072", fontSize: 10, fontFamily: "JetBrains Mono, monospace", flexShrink: 0, marginLeft: 12 }}>{c.date}</span>
        </div>
        <p style={{ color: "#4a443c", fontSize: 13, lineHeight: 1.8 }}>{c.content}</p>
      </div>)}
    </div>
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
  const prices = usePrices(TICKERS, finnhubKey);
  const [tab, setTabRaw] = useState("dashboard"), [hovP, setHovP] = useState(null), [cmd, setCmd] = useState(false), [showHero, setShowHero] = useState(true), [mounted, setMounted] = useState(false);
  const setTab = (t) => { setTabRaw(t); window.scrollTo(0, 0); };
  useEffect(() => { window.scrollTo(0, 0); const t = setTimeout(() => { setShowHero(false); setMounted(true); }, 2900); return () => clearTimeout(t); }, []);
  useEffect(() => { const h = e => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmd(true); } if (e.key === "Escape") setCmd(false); if (!e.metaKey && !e.ctrlKey && !e.altKey && ["1", "2", "3", "4", "5", "6"].includes(e.key) && !e.target.closest("input") && !e.target.closest("textarea")) setTab(["dashboard", "about", "projects", "research", "portfolio", "news"][+e.key - 1]); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  const tabs = [{ id: "dashboard", l: "Dashboard" }, { id: "about", l: "About" }, { id: "projects", l: "Projects" }, { id: "research", l: "Research" }, { id: "portfolio", l: "Portfolio" }, { id: "news", l: "News" }];

  return <div style={S.root}>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif&display=swap" rel="stylesheet" />
    {showHero && <Hero />}
    <Cmd open={cmd} onClose={() => setCmd(false)} onNav={t => setTab(t)} />
    <SettingsPanel apiKey={apiKey} setApiKey={setApiKey} finnhubKey={finnhubKey} setFinnhubKey={setFinnhubKey} open={showSettings} onClose={() => setShowSettings(false)} />
    <div style={{ position: "fixed", top: -200, right: -100, width: 900, height: 900, background: "radial-gradient(circle,rgba(13,109,86,0.045) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 8s ease-in-out infinite" }} />
    <div style={{ position: "fixed", bottom: -100, left: -100, width: 700, height: 700, background: "radial-gradient(circle,rgba(31,90,158,0.035) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 10s ease-in-out infinite", animationDelay: "2s" }} />
    <div style={{ position: "fixed", top: "30%", right: -100, width: 600, height: 600, background: "radial-gradient(circle,rgba(109,84,158,0.025) 0%,transparent 55%)", pointerEvents: "none", animation: "breathe 12s ease-in-out infinite", animationDelay: "4s" }} />
    <div style={{ position: "fixed", inset: 0, opacity: 0.045, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')", pointerEvents: "none" }} />

    <div className="status-bar" style={{ background: "#2b2825", padding: "7px 32px", display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "JetBrains Mono, monospace", color: "#cfc5b4", letterSpacing: 1, position: "relative", zIndex: 2 }}>
      <span>WALTON COLLEGE OF BUSINESS · UNIVERSITY OF ARKANSAS</span>
      <span><span style={{ color: "#3ecf8e" }}>●</span> OPEN TO OPPORTUNITIES · IB / PE / TRANSACTION ADVISORY</span>
    </div>

    <header style={S.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 23, fontWeight: 400, color: "#262421", letterSpacing: "-0.01em" }}>Mason J. Bennett</div>
        <div style={{ fontSize: 9, padding: "4px 12px", borderRadius: 20, background: "linear-gradient(135deg, rgba(13,109,86,0.12), rgba(13,109,86,0.06))", color: "#0d6d56", border: "1px solid #0d6d5625", fontFamily: "JetBrains Mono, monospace", boxShadow: "0 0 12px rgba(13,109,86,0.08)" }}>M.S. Finance '26</div>
      </div>
      <nav style={{ display: "flex", gap: 2, background: "rgba(255,253,249,0.85)", borderRadius: 12, padding: 4, border: "1px solid #e3d5bf", boxShadow: "inset 0 2px 6px rgba(64,52,32,0.07)" }}>
        {tabs.map((t, i) => <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabA : {}) }}><span style={{ fontSize: 8, opacity: 0.3, marginRight: 4 }}>{i + 1}</span>{t.l}</button>)}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ ...S.btn, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 10, padding: "5px 12px" }} title="Download Resume">📄 Resume</a>
        <button onClick={() => setShowSettings(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: apiKey ? "#0d6d5608" : "rgba(255,253,249,0.85)", border: `1px solid ${apiKey ? "#0d6d5620" : "#e9ddc9"}`, borderRadius: 8, padding: "5px 10px", color: apiKey ? "#0d6d56" : "#8a8072", fontSize: 10, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }} title={apiKey ? "API Connected" : "Settings"}>{apiKey ? "⚡ API" : "⚙"}</button>
        <button onClick={() => setCmd(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 8, padding: "5px 10px", color: "#8a8072", fontSize: 10, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>⌘K</button>
        {LINKS.slice(0, 2).map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8072", textDecoration: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1px solid #e9ddc9", transition: "all 0.25s" }}><span style={{ fontSize: 9, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{l.ic}</span></a>)}
      </div>
    </header>

    <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #0d6d56, #1f5a9e, transparent)", backgroundSize: "200% 100%", animation: "gradientShift 10s ease infinite", opacity: 0.5 }} />

    <div style={{ overflow: "hidden", borderBottom: "1px solid #e9ddc930", background: "rgba(253,248,240,0.92)", padding: "7px 0", position: "relative", maskImage: "linear-gradient(90deg, transparent, black 60px, black calc(100% - 60px), transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 60px, black calc(100% - 60px), transparent)" }}><div style={{ display: "flex", gap: 0, animation: "scroll 55s linear infinite", width: "max-content", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{[...prices, ...prices].map((t, i) => <a key={i} href={`https://www.tradingview.com/symbols/${t.symbol}/`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 8, whiteSpace: "nowrap", paddingRight: 18, marginRight: 18, borderRight: "1px solid #e9ddc930", textDecoration: "none", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}><span style={{ color: "#8a8072", fontWeight: 600 }}>{t.symbol}</span><span style={{ color: "#6f675c" }}>${t.price}</span><span style={{ color: parseFloat(t.change) >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{parseFloat(t.change) >= 0 ? "+" : ""}{t.change}%</span></a>)}</div></div>

    <main style={{ padding: 32, maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: "all 0.6s ease 0.3s" }}>

      {tab === "dashboard" && <div>
        <div style={{ marginBottom: 24, animation: "fadeUp 0.5s ease both", padding: "20px 24px", background: "linear-gradient(135deg, rgba(255,253,249,0.9), rgba(251,245,236,0.7))", borderRadius: 16, border: "1px solid #e3d5bf", boxShadow: "0 4px 20px rgba(64,52,32,0.07)" }}><Clock /></div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.08s both" }}>
            <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Watchlist<Info text="Live market prices grouped by signal: indices (SPY, QQQ, IWM), mega-cap movers (NVDA, AAPL, MSFT, JPM, TSLA), and macro indicators (TLT for rates, GLD for risk-off, UUP for dollar). Click any ticker for TradingView. Source: Finnhub.io" />{apiKey && <Info text={"Signal cheat sheet: TLT drops + SPY flat \u2192 rates rising, deal flow slows. GLD + TLT both spike \u2192 risk-off, market scared. IWM diverges from SPY \u2192 small-cap sentiment shifting (PE pipeline signal). QQQ outpaces SPY \u2192 growth/tech rotation. JPM moves on earnings \u2192 read-through on credit conditions and IB deal activity. UUP rising \u2192 dollar strengthening, pressure on international deals and EM. NVDA guidance \u2192 AI capex cycle indicator, affects entire tech sector. TLT rising + SPY rising \u2192 goldilocks (rates falling, equities up)."} linkLabel="TradingView" link="https://www.tradingview.com" />}</h2>
            {prices.map(t => <a key={t.symbol} href={`https://www.tradingview.com/symbols/${t.symbol}/`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 10, transition: "all 0.2s", cursor: "pointer", borderLeft: "2px solid transparent", textDecoration: "none" }} onMouseEnter={e => {e.currentTarget.style.background = "rgba(13,109,86,0.04)"; e.currentTarget.style.borderLeftColor = "#0d6d5650";}} onMouseLeave={e => {e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent";}}>
              <div><span style={{ color: "#33302c", fontWeight: 600, fontSize: 13 }}>{t.symbol}</span><span style={{ color: "#8a8072", fontSize: 11, marginLeft: 8 }}>{t.name}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Spark pos={parseFloat(t.change) >= 0} /><span style={{ color: "#33302c", fontFamily: "JetBrains Mono, monospace", fontSize: 13, minWidth: 60, textAlign: "right" }}>${t.price}</span><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, minWidth: 52, textAlign: "right", color: parseFloat(t.change) >= 0 ? "#0d6d56" : "#b2342b", fontWeight: 600 }}>{parseFloat(t.change) >= 0 ? "+" : ""}{t.change}%</span></div>
            </a>)}
          </section>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.12s both" }}>
              <h2 style={S.cardTitle}><span style={{ color: "#6d549e" }}>◆</span> Portfolio<Info text="Target portfolio allocation by weight. Hover over the donut chart to see individual holdings and their percentage of the total portfolio. Rebalanced quarterly. Source: Personal allocation targets." link="https://www.investopedia.com/terms/a/assetallocation.asp" linkLabel="Asset allocation basics" /></h2>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Donut data={PORTFOLIO} size={170} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>{PORTFOLIO.map((p, i) => { const C = ["#0d6d56", "#1f5a9e", "#6d549e", "#990f3d", "#b0741e", "#b3551d", "#6f675c"]; return <div key={p.ticker} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}><div style={{ width: 7, height: 7, borderRadius: 2, background: C[i % C.length] }} /><span style={{ color: "#33302c", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, minWidth: 42 }}>{p.ticker}</span><span style={{ color: "#6f675c", flex: 1 }}>{p.name}</span><span style={{ color: "#6f675c", fontFamily: "JetBrains Mono, monospace" }}>{p.weight}%</span></div>; })}</div>
              </div>
            </section>
            <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.16s both" }}>
              <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Quick Links<Info text="One-click access to essential finance platforms — Bloomberg, Reuters, EDGAR, TradingView, and more." /></h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{QLINKS.map(s => <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer" style={{...S.chip, boxShadow: "0 2px 6px rgba(64,52,32,0.05)"}} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5640"; e.currentTarget.style.color = "#0d6d56"; e.currentTarget.style.background = "rgba(13,109,86,0.06)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(13,109,86,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e9ddc9"; e.currentTarget.style.color = "#6f675c"; e.currentTarget.style.background = "rgba(255,253,249,0.85)"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(64,52,32,0.05)"; e.currentTarget.style.transform = "none"; }}>{s.n}</a>)}</div>
            </section>
          </div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <section style={{ ...S.card, animation: "fadeUp 0.5s ease 0.2s both" }}><h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Sector Heatmap<Info text="Visual map of sector performance by GICS sector. Size reflects relative market cap weight. Green = positive, red = negative, yellow = flat. Click any ticker to open TradingView. Source: Finnhub.io real-time quotes (5-min cache)." link="https://www.investopedia.com/terms/s/sector-analysis.asp" linkLabel="Sector rotation & analysis" /></h2><HeatMap finnhubKey={finnhubKey} /></section>
          <div style={{ animation: "fadeUp 0.5s ease 0.24s both" }}><Notes /></div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <RegimeIndicator apiKey={apiKey} />
          <EarningsCal apiKey={apiKey} />
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <EconCalendar apiKey={apiKey} />
        </div>
      </div>}

      {tab === "news" && <div style={{ animation: "fadeUp 0.4s ease both" }}><NewsFeed apiKey={apiKey} /></div>}

      {tab === "portfolio" && <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <h1 style={S.pageTitle}>Portfolio Allocation</h1><p style={{ color: "#6f675c", marginBottom: 32, fontSize: 14 }}>Target weights — rebalanced quarterly.</p>
        <div className="portfolio-layout" style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}><Donut data={PORTFOLIO} size={220} /><div style={{ flex: 1, minWidth: 300 }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Ticker", "Name", "Type", "Weight"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", borderBottom: "1px solid #e9ddc9" }}>{h}</th>)}</tr></thead><tbody>{PORTFOLIO.map(p => <tr key={p.ticker} style={{ borderBottom: "1px solid #e9ddc910" }} onMouseEnter={e => e.currentTarget.style.background = "#e9ddc910"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><td style={{ padding: "12px", fontSize: 13, color: "#0d6d56", fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{p.ticker}</td><td style={{ padding: "12px", fontSize: 13, color: "#6f675c" }}>{p.name}</td><td style={{ padding: "12px" }}><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: p.type === "ETF" ? "#1f5a9e10" : p.type === "Crypto" ? "#b0741e10" : "#0d6d5610", color: p.type === "ETF" ? "#1f5a9e" : p.type === "Crypto" ? "#b0741e" : "#0d6d56" }}>{p.type}</span></td><td style={{ padding: "12px", fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#6f675c" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 80, height: 4, background: "#f6eee1", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${p.weight * 3.3}%`, height: "100%", background: "linear-gradient(90deg,#0d6d56,#1f5a9e)", borderRadius: 2 }} /></div>{p.weight}%</div></td></tr>)}</tbody></table></div></div>
      </div>}

      {tab === "research" && <ResearchTab />}

      {tab === "projects" && <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <h1 style={S.pageTitle}>Projects</h1><p style={{ color: "#6f675c", marginBottom: 32, fontSize: 14 }}>Financial modeling, econometrics, and quantitative analysis.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(360px,100%),1fr))", gap: 14 }}>{PROJECTS.map((p, i) => <div key={i} style={{ ...S.pCard, ...(hovP === i ? { borderColor: "#0d6d5650", transform: "translateY(-6px) scale(1.01)", boxShadow: "0 20px 50px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.15), 0 0 40px rgba(13,109,86,0.05)" } : {}), animation: "fadeUp 0.5s ease both", animationDelay: `${i * 0.07}s` }} onMouseEnter={() => setHovP(i)} onMouseLeave={() => setHovP(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>PROJECT_{String(i + 1).padStart(2, "0")}{p.completed && <span style={{ marginLeft: 8, color: "#a2977f" }}>· {p.completed}</span>}</span><div style={{ display: "flex", alignItems: "center", gap: 6 }}>{p.updated && <span style={{ fontSize: 8, color: "#a2977f", fontFamily: "JetBrains Mono, monospace" }}>Updated {p.updated}</span>}<span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: p.status === "In Progress" ? "#b0741e08" : "#0d6d5608", color: p.status === "In Progress" ? "#b0741e" : "#0d6d56", fontFamily: "JetBrains Mono, monospace" }}>{p.status}</span></div></div>
          <h3 style={{ color: "#33302c", fontSize: 17, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
          <p style={{ color: "#6f675c", fontSize: 13, lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{p.desc}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: p.url ? 12 : 0 }}>{p.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: "#e9ddc930", color: "#6f675c", fontFamily: "JetBrains Mono, monospace" }}>{t}</span>)}</div>
          {(p.url || p.demo) && <div style={{ display: "flex", gap: 12 }}>
            {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#1f5a9e", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 10px", background: "#1f5a9e08", border: "1px solid #1f5a9e20", borderRadius: 6, transition: "all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#1f5a9e15";e.currentTarget.style.borderColor="#1f5a9e40"}} onMouseLeave={e=>{e.currentTarget.style.background="#1f5a9e08";e.currentTarget.style.borderColor="#1f5a9e20"}}>▶ Live Demo <span style={{fontSize:9}}>↗</span></a>}
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#0d6d56", textDecoration: "none", fontFamily: "JetBrains Mono, monospace", padding: "4px 0", transition: "opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{p.url.includes("github") ? "GitHub" : p.url.includes("paper") ? "View Paper" : "View"} <span style={{fontSize:9}}>↗</span></a>}
          </div>}
        </div>)}</div>
      </div>}

      {tab === "about" && <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 820 }}>
        <h1 style={S.pageTitle}>About</h1>
        <div style={{ background: "linear-gradient(135deg, rgba(13,109,86,0.5), rgba(224,209,186,0.9), rgba(31,90,158,0.35))", borderRadius: 18, padding: 1, boxShadow: "0 12px 48px rgba(13,109,86,0.08)" }}>
        <div style={{ ...S.card, background: "linear-gradient(135deg,#f6eee1,#fdf8f0,#f6eee1)", border: "none", borderRadius: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(circle,rgba(13,109,86,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, background: "radial-gradient(circle,rgba(31,90,158,0.04) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div className="bio-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>
            <div style={{ flexShrink: 0, borderRadius: 22, padding: 2, background: "linear-gradient(135deg, #0d6d56, #1f5a9e)", boxShadow: "0 12px 40px rgba(13,109,86,0.15)" }}>
              <img src="/headshot.png" alt="Mason J. Bennett" className="bio-headshot" style={{ width: 180, height: 180, borderRadius: 20, objectFit: "cover", objectPosition: "center 15%", imageRendering: "crisp-edges", filter: "contrast(1.04) brightness(1.02)", display: "block" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: "#33302c", fontSize: 30, fontFamily: "Instrument Serif, serif", marginBottom: 4, textShadow: "0 2px 16px rgba(0,0,0,0)" }}>Mason J. Bennett</h2>
              <p style={{ color: "#0d6d56", fontSize: 12, fontFamily: "JetBrains Mono, monospace", marginBottom: 16 }}>M.S. Finance · University of Arkansas · Class of 2026</p>
              <p style={{ color: "#4a443c", fontSize: 14, lineHeight: 1.85, marginBottom: 18 }}>M.S. Finance graduate (May 2026, 4.0 GPA) from the Sam M. Walton College of Business, focused on valuation, transaction analysis, portfolio management, and financial modeling. Pursuing investment banking, private equity, and transaction advisory roles with hands-on experience in DCF, LBO, and three-statement modeling.</p>
              <div className="bio-badges" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Investment Banking", "Private Equity", "Transaction Advisory"].map(t => <span key={t} style={{ fontSize: 10, padding: "5px 14px", borderRadius: 20, background: "linear-gradient(135deg, rgba(13,109,86,0.1), rgba(31,90,158,0.06))", color: "#0d6d56", border: "1px solid rgba(13,109,86,0.2)", fontFamily: "JetBrains Mono, monospace", boxShadow: "0 2px 8px rgba(13,109,86,0.06)" }}>{t}</span>)}</div>
            </div>
          </div>
        </div>
        </div>
        <div className="about-stats" style={{ ...S.card, margin: "14px 0", display: "flex", justifyContent: "space-around", padding: "20px 32px", flexWrap: "wrap", gap: 16 }}>
          {[["Master's GPA", "4.0", "Walton College"], ["Undergrad GPA", "3.62", "Dean's List ×4"], ["Projects", "5", "Academic & Independent"], ["Graduated", "May 2026", "M.S. Finance"]].map(([label, val, sub], i) => (
            <div key={label} style={{ textAlign: "center", padding: "20px 24px", borderRadius: 14, background: "linear-gradient(145deg, #f6eee1, #f6eee1)", border: "1px solid #e3d5bf", flex: "1 1 0", minWidth: 120, boxShadow: "inset 0 2px 10px rgba(64,52,32,0.07), 0 1px 0 rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: "#33302c", marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6f675c", fontWeight: 500, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 9, color: "#8a8072", fontFamily: "JetBrains Mono, monospace" }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#1f5a9e" }}>◆</span> Timeline</h2>
          <div style={{ position: "relative", paddingLeft: 22 }}><div style={{ position: "absolute", left: 5, top: 5, bottom: 5, width: 2, background: "linear-gradient(180deg,#0d6d56,#1f5a9e,#e9ddc9)", borderRadius: 1 }} />
            {EXPERIENCE.map((e, i) => <div key={i} style={{ position: "relative", marginBottom: i < EXPERIENCE.length - 1 ? 18 : 0 }}>
              <div style={{ position: "absolute", left: -19, top: 4, width: 9, height: 9, borderRadius: 5, background: e.type === "edu" ? "#0d6d56" : "#1f5a9e", border: "2px solid #f6eee1" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}><h3 style={{ color: "#33302c", fontSize: 13, fontWeight: 600 }}>{e.role}</h3><span style={{ color: "#8a8072", fontSize: 9, fontFamily: "JetBrains Mono, monospace", flexShrink: 0, marginLeft: 8 }}>{e.date}</span></div>
              <p style={{ color: e.type === "edu" ? "#0d6d56" : "#1f5a9e", fontSize: 10, marginBottom: 3, fontFamily: "JetBrains Mono, monospace" }}>{e.org}</p>
              <p style={{ color: "#6f675c", fontSize: 11, lineHeight: 1.5 }}>{e.detail}</p>
            </div>)}
          </div>
        </div>
        <div style={{ ...S.card, marginBottom: 14 }}>
          <h2 style={S.cardTitle}><span style={{ color: "#0d6d56" }}>◆</span> Skills & Tools</h2>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Core Finance</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Financial Modeling", "Valuation (DCF, LBO, Comps)", "Investment Analysis", "Transaction Analysis", "Portfolio Management", "Econometrics", "Regression Analysis", "Quantitative Research"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))", color: "#0d6d56", border: "1px solid rgba(13,109,86,0.15)", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(13,109,86,0.04)" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(13,109,86,0.12)";e.currentTarget.style.boxShadow="0 4px 12px rgba(13,109,86,0.1)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(13,109,86,0.08), rgba(13,109,86,0.04))";e.currentTarget.style.boxShadow="0 2px 6px rgba(13,109,86,0.04)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
          <div><div style={{ fontSize: 8, color: "#8a8072", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>Tools</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Excel", "Python", "Stata", "RStudio", "SQL", "PowerPoint", "Streamlit"].map(s => <span key={s} style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", color: "#6f675c", border: "1px solid #e3d5bf", transition: "all 0.25s", cursor: "default", boxShadow: "0 2px 6px rgba(64,52,32,0.05)" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#1f5a9e40";e.currentTarget.style.color="#1f5a9e";e.currentTarget.style.boxShadow="0 4px 12px rgba(31,90,158,0.08)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.color="#6f675c";e.currentTarget.style.boxShadow="0 2px 6px rgba(64,52,32,0.05)";e.currentTarget.style.transform="none"}}>{s}</span>)}</div></div>
        </div>
        <div className="dash-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b0741e" }}>◆</span> Reading List</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{READING.map((b, i) => <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "linear-gradient(145deg, #fffdf9, #f6eee1)", border: "1px solid #e3d5bf", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.25s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#b0741e30";e.currentTarget.style.transform="translateX(4px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#e3d5bf";e.currentTarget.style.transform="none"}}><div><div style={{ color: "#33302c", fontSize: 12, fontWeight: 500 }}>{b.title}</div><div style={{ color: "#8a8072", fontSize: 10 }}>{b.author}</div></div><span style={{ fontSize: 8, padding: "3px 10px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace", background: b.s === "Reading" ? "rgba(31,90,158,0.1)" : b.s === "Done" ? "rgba(13,109,86,0.1)" : "rgba(111,103,92,0.08)", color: b.s === "Reading" ? "#1f5a9e" : b.s === "Done" ? "#0d6d56" : "#6f675c", border: `1px solid ${b.s === "Reading" ? "rgba(31,90,158,0.2)" : b.s === "Done" ? "rgba(13,109,86,0.2)" : "rgba(111,103,92,0.15)"}` }}>{b.s === "Done" ? "Completed" : b.s === "Ref" ? "Reference" : b.s}</span></div>)}</div>
          </div>
          <div style={S.card}>
            <h2 style={S.cardTitle}><span style={{ color: "#b3551d" }}>◆</span> Currently Exploring</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{ topic: "LBO Modeling & PE Deal Structuring", desc: "Completed full LBO models and IC pitch decks for EA and Jagex — now extending the framework to new buyout targets." },
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
        <div style={S.card}>
          <h2 style={S.cardTitle}><span style={{ color: "#990f3d" }}>◆</span> Connect</h2>
          <div className="connect-links" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{LINKS.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", color: "#33302c", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e3d5bf", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 4px 12px rgba(64,52,32,0.07)", flex: "1 1 0", justifyContent: "center", minWidth: 140 }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#0d6d5650"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,109,86,0.12), 0 0 0 1px rgba(13,109,86,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e3d5bf"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(64,52,32,0.07)"; }}><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "#0d6d56" }}>{l.ic}</span>{l.label}</a>)}</div>
        </div>
      </div>}
    </main>

    <footer style={{ padding: "26px 32px", borderTop: "1px solid #ddcfb8", background: "linear-gradient(180deg, transparent, rgba(247,240,229,0.8))", boxShadow: "0 -4px 30px rgba(64,52,32,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
        {LINKS.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8072", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#0d6d56"} onMouseLeave={e => e.currentTarget.style.color = "#8a8072"}>{l.label}</a>)}
      </div>
      <div style={{ color: "#a2977f", fontSize: 9, fontFamily: "JetBrains Mono, monospace", display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <span>Mason J. Bennett</span><span>·</span><span>M.S. Finance, Walton College</span><span>·</span><span>© {new Date().getFullYear()}</span><span>·</span><span>⌘K or 1-6</span>
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
      html{scroll-behavior:smooth}
      body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
      ::selection{background:rgba(13,109,86,0.2);color:#33302c}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d8c8b0;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#a2977f}
      input:focus,textarea:focus,select:focus{border-color:#0d6d5660!important;box-shadow:0 0 0 4px rgba(13,109,86,0.12),0 0 20px rgba(13,109,86,0.08)!important}
      button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #0d6d5660;outline-offset:2px;border-radius:10px}
      button:hover{transform:translateY(-1px)}button:active{transform:translateY(0px)}
      @media(max-width:768px){
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
  card: { background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", border: "1px solid #e3d5bf", borderRadius: 16, padding: 24, boxShadow: "0 8px 32px rgba(64,52,32,0.08), 0 1px 0 rgba(255,255,255,0.6) inset", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" },
  cardTitle: { fontSize: 11, fontWeight: 600, color: "#6f675c", marginBottom: 16, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: 2, paddingBottom: 12, borderBottom: "1px solid rgba(13,109,86,0.12)", display: "flex", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 44, fontWeight: 400, fontFamily: "'Instrument Serif',serif", marginBottom: 10, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#262421" },
  chip: { display: "inline-block", padding: "7px 14px", borderRadius: 10, background: "rgba(255,253,249,0.85)", color: "#6f675c", fontSize: 11, fontWeight: 500, textDecoration: "none", border: "1px solid #e9ddc9", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", backdropFilter: "blur(8px)" },
  pCard: { display: "flex", flexDirection: "column", background: "linear-gradient(145deg, #fffdf9, #fbf5ec)", border: "1px solid #e3d5bf", borderRadius: 16, padding: 24, transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer", boxShadow: "0 8px 32px rgba(64,52,32,0.08), 0 1px 0 rgba(255,255,255,0.6) inset, inset 3px 0 0 #0d6d5630" },
  btn: { background: "linear-gradient(135deg, #fffdf9, #fbf5ec)", color: "#0d6d56", border: "1px solid #0d6d5625", borderRadius: 10, padding: "7px 16px", fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500, transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 2px 8px rgba(64,52,32,0.05)" },
  input: { background: "#f6eee1", border: "1px solid #e9ddc9", borderRadius: 10, padding: "10px 14px", color: "#33302c", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", outline: "none", width: "100%", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" },
};
