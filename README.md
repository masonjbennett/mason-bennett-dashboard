# Mason Bennett — Finance Dashboard

Mason Bennett's personal site: an FT-inspired "paper & ink" financial newspaper —
recruiting front door, daily market tool, and financial-learning hub. React + Vite,
single-file app (src/App.jsx), serverless functions in api/, deployed on Vercel.

## Features
- **Markets**: live watchlist + macro tape (Finnhub via serverless proxy), Treasury
  yield-curve plate, FRED Macro Ledger, credit/inflation status strip, cross-asset
  FX/crypto row, sector heatmap, market regime with live CNN Fear & Greed, AI
  earnings/econ calendars, "/" quote lookup with per-ticker headlines
- **News**: The Standing Wire (keyless clustered RSS from Reuters/WSJ/CNBC/
  MarketWatch/Yahoo), morning & close AI briefings with fact-checking and "So What?"
  analysis (key-gated), SEC EDGAR Filings Wire, newsletter Reading Ledger
- **Learning**: 241-question Technicals Desk, Question of the Day, Three-Statement
  Ripple drill, Daily Drill (six interleaved stations), paper-LBO Puzzle Corner,
  LBO sandbox with Damodaran sector anchors, merger math, HCA football field
- **Desk Mode (private)**: SM-2 review docket, errata ledger, edition streak,
  Today's Desk, price alerts, Market Diary with tape stamps, paper-trading
  Positions Ledger, Bennett vs. the Tape predictions, 7 O'Clock Note, Late Edition
- Command palette (Ctrl+K), keyboard shortcuts (1–4 for tabs, "/" for quotes)

## Keys (optional, entered in Settings — stored in the browser only)
- Anthropic API key: powers the AI briefings, calendars, and desk features
- Finnhub key: direct quotes in local dev (production uses the serverless proxy
  with FINNHUB_KEY set in Vercel)

## Setup (Local Development)

### Prerequisites
- Node.js 18+ installed (download from https://nodejs.org)

### Steps

1. Open a terminal and navigate to this folder:
   ```
   cd mason-bennett-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Deploy to Vercel (Free)

### Option A: Via GitHub (Recommended — auto-deploys on every push)

1. Create a GitHub account if you don't have one (github.com)

2. Create a new repository on GitHub:
   - Go to github.com/new
   - Name it "mason-bennett-dashboard"
   - Keep it public or private (your choice)
   - Don't add README/gitignore (we already have them)
   - Click "Create repository"

3. Push this code to GitHub (run these in the project folder):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mason-bennett-dashboard.git
   git push -u origin main
   ```

4. Go to vercel.com and sign in with your GitHub account

5. Click "Add New..." → "Project"

6. Import your "mason-bennett-dashboard" repository

7. Click "Deploy" — Vercel auto-detects Vite and configures everything

8. Your site will be live at something like: mason-bennett-dashboard.vercel.app

9. (Optional) Add a custom domain in Vercel project settings

### Option B: Direct Deploy (No GitHub)

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Run in the project folder:
   ```
   vercel
   ```

3. Follow the prompts — your site will be live in ~60 seconds

## Making Changes After Deployment

1. Edit files in VS Code
2. Save
3. If using GitHub:
   ```
   git add .
   git commit -m "description of change"
   git push
   ```
   Vercel auto-deploys within 30 seconds.

## File Structure
```
mason-bennett-dashboard/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── .gitignore          # Files to exclude from git
├── README.md           # This file
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # The entire dashboard (all components)
```

## Customization

All personal data is in the CONFIG section at the top of `src/App.jsx`:
- TICKERS — the watchlist
- PORTFOLIO — sample allocation shown to visitors
- PROJECTS / DEALS / ARTIFACTS — project and deal-sheet cards
- EXPERIENCE — the timeline
- READING — the reading list
- LINKS / QLINKS — social and quick links
- src/technicals.json — the interview question bank
- public/econ-2026.json, public/damodaran-2026.json — annual January refresh
- api/rss.js SOURCES — the news wire and newsletter feed registry
