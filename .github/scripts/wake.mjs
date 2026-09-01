// Keep the Streamlit Community Cloud demos awake — with a REAL browser session.
//
// Why not curl. A *.streamlit.app URL is behind a cookie-based auth redirect:
//   app.streamlit.app/  -> 303 share.streamlit.io/-/auth/app
//                       -> 303 app.streamlit.app/-/login?payload=...
//                       -> 303 app.streamlit.app/            -> loops
// curl without a cookie jar never escapes it (50 redirects, then gives up),
// and curl WITHOUT -L just downloads the first 86-byte redirect stub. The
// previous version of this workflow did the latter and swallowed the result
// with `|| true`, so it reported success every four hours for two months
// while never once reaching either app — which is how the budgeting app was
// found asleep on 2026-08-29 under a wall of green check marks.
//
// Even a cookie-following curl would only fetch the HTML shell. Streamlit
// counts a *session*, which is a WebSocket the page opens after it hydrates,
// so keeping an app awake needs something that actually runs the page.
//
// This script therefore drives headless Chrome, waits for the app to hydrate,
// wakes it if it is already asleep, and FAILS THE JOB if it cannot. A
// keep-alive that cannot fail is indistinguishable from one that is broken.
import puppeteer from "puppeteer-core";

const APPS = [
  { name: "portfolio-app", url: "https://portfolio-app-ifh8afmcuxkyr6ivov9fmj.streamlit.app/" },
  { name: "budgeting-app", url: "https://masonbennett-budget.streamlit.app/" },
];

const EXE =
  process.env.CHROME_PATH ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : "/usr/bin/google-chrome");

const HOLD_MS = +(process.env.HOLD_MS || 12000); // keep the session open a beat
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  defaultViewport: { width: 1400, height: 900 },
});

const results = [];

for (const app of APPS) {
  const page = await browser.newPage();
  const r = { name: app.name, wokeIt: false, hydrated: false, error: null };
  try {
    await page.goto(app.url, { waitUntil: "networkidle2", timeout: 120000 });

    // Already asleep? Click the wake button and wait it out.
    const asleep = await page.evaluate(() => /gone to sleep|Zzzz/i.test(document.body.innerText));
    if (asleep) {
      r.wokeIt = true;
      const btn = await page.evaluate(() => {
        const b = [...document.querySelectorAll("button, a")]
          .find((x) => /get this app back up|wake/i.test(x.innerText));
        if (!b) return false;
        b.click();
        return true;
      });
      if (!btn) throw new Error("sleep page shown but no wake control found");
      await sleep(20000);
    }

    // Hydrated means the Streamlit app itself rendered — the shell wraps it in
    // an iframe, so look inside that, not at the wrapper.
    await page.waitForFunction(
      () => {
        const f = [...document.querySelectorAll("iframe")].find((x) => /streamlit\.app/.test(x.src));
        const d = f && f.contentDocument;
        return !!(d && d.querySelector('[data-testid="stApp"]'));
      },
      { timeout: 180000, polling: 1000 }
    );
    r.hydrated = true;

    // Hold the socket open briefly so it registers as a real session.
    await sleep(HOLD_MS);

    r.detail = await page.evaluate(() => {
      const f = [...document.querySelectorAll("iframe")].find((x) => /streamlit\.app/.test(x.src));
      const d = f.contentDocument;
      return {
        widgets: d.querySelectorAll("[data-testid]").length,
        title: d.title || document.title,
      };
    });
  } catch (e) {
    r.error = e.message;
  } finally {
    await page.close().catch(() => {});
  }
  results.push(r);
  console.log(
    `${r.hydrated ? "OK  " : "FAIL"} ${r.name.padEnd(16)}` +
      (r.wokeIt ? " (was asleep, woken)" : "") +
      (r.detail ? ` widgets=${r.detail.widgets} title=${JSON.stringify(r.detail.title)}` : "") +
      (r.error ? ` error=${r.error}` : "")
  );
}

await browser.close();

const failed = results.filter((r) => !r.hydrated);
if (failed.length) {
  console.error(`\n${failed.length} app(s) did not come up: ${failed.map((f) => f.name).join(", ")}`);
  process.exit(1);
}
console.log(`\nall ${results.length} apps hydrated`);
