/* A1Plot service worker — speeds up repeat visits and enables offline use.
 *
 * Safety-first strategy (avoids the "stuck on an old version" problem):
 *  - HTML / page navigations: NETWORK-FIRST, so anyone online always gets the
 *    latest code; the cache is only a fallback when the network fails (offline).
 *  - Content-hashed assets (/_next/static, /assets): CACHE-FIRST, because their
 *    URLs change whenever the content changes, so a cached copy is never stale.
 *
 *    CAVEAT: this assumes every /assets/ filename is content-hashed. It
 *    isn't true for a handful of fixed-name files (logo.webp, the
 *    pwa-icon-*.png icons) — editing one of THOSE in place while keeping the
 *    same filename (e.g. regenerating a PWA icon) will NOT reach anyone with
 *    an existing cache unless CACHE_VERSION is bumped. This happened once
 *    already: the PWA icons were fixed to use the correct logo but
 *    CACHE_VERSION wasn't bumped, so already-cached browsers kept serving
 *    the old (wrong) icon indefinitely. Bump CACHE_VERSION any time one of
 *    these fixed-name files changes.
 *  - Cross-origin requests (Firebase, Google Maps, GA, Meta) are NOT touched.
 */
const CACHE_VERSION = 'v3';
const CACHE = `a1plot-${CACHE_VERSION}`;
const PRECACHE = [
  '/', '/offline.html', '/manifest.json', '/assets/logo.webp',
  '/assets/pwa-icon-192.png', '/assets/pwa-icon-512.png', '/assets/pwa-icon-maskable-512.png',
];

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
