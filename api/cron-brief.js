// Vercel cron: draft an edition, analyse it, check it, and read it aloud — before Mason gets to it.
//
// Scheduled from vercel.json, twice a weekday. Vercel cron is UTC-ONLY and Hobby fires anywhere
// inside the scheduled hour, so each job is really choosing a one-hour window that has to stay
// sensible across DST:
//   11:00 UTC — 06:00-06:59 Central in summer, 05:00-05:59 in winter. Both sit entirely before the
//               07:30 CT economic releases and the 08:30 CT open, so the morning briefing has the
//               same character every day. 12:00 UTC would straddle the data drop all summer.
//   22:00 UTC — 17:00-17:59 Central in summer, 16:00-16:59 in winter. The US close is 20:00 UTC in
//               summer and 21:00 in winter, so this is one to two hours after the bell either way —
//               late enough that the after-hours movers the close prompt asks for have printed.
// Weekdays only: a Saturday briefing has no session to report and would still cost money.
//
// This is a SCHEDULER, not a second implementation. It calls the same /api/brief endpoint the
// browser does, so there is one code path for producing a briefing and one place for it to go wrong.
// Each inner call is its own invocation with its own duration budget, which is also why the chain is
// four requests rather than one long one.
//
// THE FACT-CHECK IS NOW IN THE CHAIN, and it did not used to be. It was left out on the grounds that
// it costs about what the draft does and grades a briefing nobody has read yet — true, and it stayed
// a button for months on that basis. What changed is the reading: an edition is now listened to on a
// commute rather than read at a desk, and audio is the one format you cannot skim. A caveat you would
// have caught by eye in the written copy goes straight past you in speech, so the check has to have
// happened BEFORE the file is made, not be available afterwards. It also has to run before the audio
// for a plainer reason: the spoken script reads the flagged claims out, and a reading made first
// would be a reading of a briefing nobody had checked.
//
// Roughly $0.65 an edition, so about $27 a month across two editions on weekdays, plus the voice
// service. That is a deliberate spend, not an accident — see vercel.json for the two schedules.
//
// Env: CRON_SECRET (Vercel sends it as `Authorization: Bearer …`), plus the SYNC_SECRET and
// ANTHROPIC_KEY that /api/brief already needs, and OPENAI_KEY for the audio step.
import { timingSafeEqual } from "node:crypto";

export const config = { maxDuration: 300 };

function authed(req) {
  const want = process.env.CRON_SECRET || "";
  const got = String(req.headers.authorization || "");
  const expect = `Bearer ${want}`;
  if (!want || !got) return false;
  const a = Buffer.from(expect), b = Buffer.from(got);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return timingSafeEqual(a, b);
}

// Prefer the stable production domain over VERCEL_URL, which is the per-deployment hostname: a
// cron firing against a deployment-specific URL still works, but the logs read as though a
// preview generated production's briefing.
function baseUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : null;
}

// Which edition this firing is for. The query string is the explicit answer and vercel.json gives
// it; the hour is a fallback so that a schedule edited in the dashboard — where the query string is
// easy to drop — still produces the right edition instead of silently drafting a second morning.
// 16:00 UTC splits the two windows (11:00 and 22:00) with hours to spare on both sides.
function editionFor(req) {
  const q = String((req.query && req.query.type) || "");
  if (q === "morning" || q === "close") return q;
  return new Date().getUTCHours() < 16 ? "morning" : "close";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!authed(req)) return res.status(401).json({ error: "unauthorized" });
  if (!process.env.SYNC_SECRET) return res.status(503).json({ error: "SYNC_SECRET is not configured" });
  const base = baseUrl();
  if (!base) return res.status(503).json({ error: "no deployment URL to call" });
  const type = editionFor(req);

  const run = async step => {
    const r = await fetch(`${base}/api/brief`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mjb-sync": process.env.SYNC_SECRET },
      body: JSON.stringify({ type, step }),
    });
    let d = null; try { d = await r.json(); } catch {}
    return { ok: r.ok, status: r.status, body: d };
  };

  // No `force`, on any step. A cron that redrafted would double-bill whenever Vercel delivers the
  // same scheduled run twice — which their docs say happens — and would also throw away work Mason
  // had already paid for by hand before the job fired.
  const draft = await run("brief");
  if (!draft.ok) {
    console.error(`[cron-brief] ${type} draft failed ${draft.status}:`, draft.body && draft.body.error);
    return res.status(502).json({ type, step: "brief", status: draft.status, error: draft.body && draft.body.error });
  }
  const reused = !!(draft.body && draft.body.reused);
  console.log(`[cron-brief] ${type} draft ok — ${reused ? "reused an existing briefing" : `${(draft.body && draft.body.searches) || 0} searches`}`);

  // Strictly in order: sowhat and verify each read-modify-write the same record, and audio reads
  // both of them. A step the record already carries is skipped rather than re-bought.
  //
  // A failed step is reported and does NOT stop the ones after it. They are independent purchases
  // over the same stored text, and a rate-limited implications pass must not also cost the edition
  // its fact-check and its audio — the briefing itself is already filed and readable either way.
  const out = { type, date: draft.body && draft.body.date, reused };
  let rec = draft.body;
  for (const [step, field] of [["sowhat", "soWhat"], ["verify", "verify"], ["audio", "audio"]]) {
    if (rec && rec[field]) { out[step] = "skipped"; continue; }
    const r = await run(step);
    out[step] = r.ok ? "ok" : `failed ${r.status}`;
    if (r.ok) rec = r.body;
    else console.error(`[cron-brief] ${type} ${step} failed:`, r.body && r.body.error);
  }
  if (out.audio === "ok" && rec && rec.audio) console.log(`[cron-brief] ${type} audio — ${rec.audio.bytes} bytes, ${rec.audio.chars} chars`);
  return res.status(200).json({ ok: true, ...out });
}
