/* Yomika PWA service worker — v1.
 * Installability needs a fetch handler; caching is deliberately conservative:
 * static assets are cache-first (refreshed in the background), pages are
 * network-first with a cache fallback for offline reads, and API/admin
 * routes are never cached so logged-in and dynamic content stays fresh. */

const CACHE = "yomika-v1";
const STATIC_RE = /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache API or admin traffic.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Static assets: serve from cache, refresh in the background.
  if (STATIC_RE.test(url.pathname) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Pages: network first, cached page only as an offline fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
