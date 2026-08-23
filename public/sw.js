/* A1Plot service worker — speeds up repeat visits and enables offline use.
 *
 * Safety-first strategy (avoids the "stuck on an old version" problem):
 *  - HTML / page navigations: NETWORK-FIRST, so anyone online always gets the
 *    latest code; the cache is only a fallback when the network fails (offline).
 *  - Content-hashed assets (/_next/static, /assets): CACHE-FIRST, because their
 *    URLs change whenever the content changes, so a cached copy is never stale.
 *  - Cross-origin requests (Firebase, Google Maps, GA, Meta) are NOT touched.
 *
 * Bump CACHE_VERSION to force a clean cache on the next deploy.
 */
const CACHE_VERSION = 'v2';
const CACHE = `a1plot-${CACHE_VERSION}`;
const PRECACHE = ['/', '/offline.html', '/manifest.json', '/assets/logo.webp'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putInCache = (request, response) => {
  if (response && response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Only handle our own origin; let Firebase/Maps/analytics hit the network directly.
  if (url.origin !== self.location.origin) return;

  // 1) Immutable, content-hashed assets → cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => putInCache(request, res)))
    );
    return;
  }

  // 2) Page navigations → network-first (fresh when online), cache/offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => putInCache(request, res))
        .catch(() =>
          caches
            .match(request)
            .then((c) => c || caches.match('/'))
            .then((c) => c || caches.match('/offline.html'))
        )
    );
    return;
  }

  // 3) Other same-origin GETs → stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => putInCache(request, res))
        .catch(() => cached);
      return cached || network;
    })
  );
});
