// Keep the budgeting app's Supabase project alive, and assert its row-level
// security at the same time.
//
// WHY THIS EXISTS. The budgeting app shipped accounts and cloud persistence in
// April 2026. Free-tier Supabase projects pause after about a week of no
// activity and are eventually reclaimed; nobody touched it, and by September the
// project host did not resolve at all. The app did not look broken — the client
// is constructed without a network call, so it booted fine — and because its
// sign-in handler caught every exception and returned one message, every visitor
// who tried to log in was told their PASSWORD was wrong. Four months of silence
// ending in the app blaming its users. This job is the thing that would have
// caught it on day eight.
//
// WHY IT ALSO CHECKS RLS. One request answers both questions, so it may as well
// assert the more important one. With row-level security enabled and a select
// policy scoped to auth.uid(), an UNAUTHENTICATED read of user_data must come
// back 200 with an empty array: the project is up, and the public key can see
// nobody's data. If rows ever come back, RLS has been turned off or the policy
// dropped, and every user's financial data is readable by anyone holding a key
// that ships in the client. That is a hard failure, not a warning.
//
// Needs two repository secrets: SUPABASE_URL and SUPABASE_ANON_KEY. The anon key
// is public by design — it is embedded in the app — but it lives in secrets so
// the URL and key can be rotated without editing this file.

const URL_BASE = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const ANON = process.env.SUPABASE_ANON_KEY || "";
const TABLE = process.env.SUPABASE_TABLE || "user_data";

if (!URL_BASE || !ANON) {
  // Not configured yet. Skip rather than fail: this lands before the project is
  // stood up, and a job that fails for a reason nobody has acted on yet gets
  // muted — which is how the last keep-alive came to be ignored.
  console.log("supabase: SUPABASE_URL / SUPABASE_ANON_KEY not set — skipping");
  process.exit(0);
}

const endpoint = `${URL_BASE}/rest/v1/${TABLE}?select=user_id&limit=1`;
let res;
try {
  res = await fetch(endpoint, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    signal: AbortSignal.timeout(30000),
  });
} catch (e) {
  // DNS failure, timeout, refused connection. This is the paused-or-deleted case.
  console.error(`supabase: cannot reach ${URL_BASE} — ${e.message}`);
  console.error("  the project is paused, deleted, or the URL is wrong.");
  console.error("  the budgeting app's login will be telling users their password is wrong.");
  process.exit(1);
}

const body = await res.text();

if (res.status === 404) {
  console.error(`supabase: reachable, but table "${TABLE}" does not exist (404)`);
  process.exit(1);
}
if (res.status === 401 || res.status === 403) {
  console.error(`supabase: reachable, but the anon key was rejected (${res.status})`);
  console.error(`  ${body.slice(0, 200)}`);
  process.exit(1);
}
if (!res.ok) {
  console.error(`supabase: unexpected ${res.status} — ${body.slice(0, 200)}`);
  process.exit(1);
}

let rows;
try {
  rows = JSON.parse(body);
} catch {
  console.error(`supabase: 200 but the body was not JSON — ${body.slice(0, 120)}`);
  process.exit(1);
}

if (!Array.isArray(rows)) {
  console.error(`supabase: 200 but the body was not a row array — ${body.slice(0, 120)}`);
  process.exit(1);
}

if (rows.length > 0) {
  console.error(`supabase: SECURITY — an unauthenticated read of ${TABLE} returned ${rows.length} row(s).`);
  console.error("  row-level security is off, or the select policy is missing.");
  console.error("  the anon key ships inside the app, so this table is public right now.");
  process.exit(1);
}

console.log(`OK   supabase         project awake, ${TABLE} present, anon read returns 0 rows (RLS holding)`);
