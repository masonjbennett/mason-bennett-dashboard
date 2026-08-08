// Service worker for the installed app. Deliberately minimal, because the dangerous failure mode
// here is a STALE SHELL: a cache-first worker would keep serving yesterday's index.html after a
// deploy, pinning readers to an old bundle that no fix could reach. So:
//   - navigations       -> NETWORK-FIRST (cache is only an offline fallback)
//   - /assets/*         -> cache-first, safe because Vite content-hashes those filenames
//   - /api/* and the rest -> never touched; live data must never be served from a cache
const V = "mjb-v1";
const SHELL = `${V}-shell`, ASSETS = `${V}-assets`;
const SHELL_URL = "/index.html";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => !k.startsWith(V)).map(k => caches.delete(k)));
  await self.clients.claim();
})()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;   // leave cross-origin (FRED, Treasury…) alone
  if (url.pathname.startsWith("/api/")) return;      // live data: always straight to the network

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) { const c = await caches.open(SHELL); c.put(SHELL_URL, fresh.clone()); }
        return fresh;
      } catch {
        return (await caches.match(SHELL_URL)) || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) { const c = await caches.open(ASSETS); c.put(req, res.clone()); }
      return res;
    })());
  }
});
