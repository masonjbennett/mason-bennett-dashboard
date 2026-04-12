# Mason Bennett — Finance Dashboard

Personal finance dashboard and portfolio website built with React + Vite.

## Features
- Live watchlist with sparkline charts
- AI-powered news feed with 6 categories (Markets, Macro, M&A/PE, Tech, Crypto, Global)
- Morning & Close briefings with fact-checking and "So What?" implications analysis
- Market regime indicator (VIX, Fear/Greed, 10Y yield)
- Earnings calendar
- Investment thesis board
- Weekly market commentary journal
- Portfolio allocation with interactive donut chart
- Sector heatmap
- Quick notes
- Command palette (Ctrl+K or Cmd+K)
- Keyboard shortcuts (1-6 for tab navigation)
- Smart auto-refresh (30min during market hours, 2hr off-hours)

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

All your personal data is in the CONFIG section at the top of `src/App.jsx`:
- TICKERS — your watchlist
- PORTFOLIO — your portfolio weights
- PROJECTS — your project cards
- EXPERIENCE — your timeline
- READING — your reading list
- LINKS — your social/contact links
- NEWS_CATS — news feed categories and article counts
- INIT_THESES — your investment theses
- INIT_COMMENTARY — your market commentary entries
