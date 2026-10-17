// Work Zone OS Service Worker - Offline Field Caching
const CACHE_NAME = 'wzos-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install: Cache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[WZOS Service Worker] Caching offline shell assets...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[WZOS Service Worker] Pre-cache non-fatal error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[WZOS Service Worker] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate & Cache-First for offline field use
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST to /api/atlas/chat handled via app fallback)
  if (request.method !== 'GET') {
    return;
  }

  // Handle static assets & font/map tiles with Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Cache valid responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            // If offline and request is an HTML navigation, return cached root/index.html
            if (request.mode === 'navigate') {
              return cache.match('/index.html') || cache.match('/');
            }
            // Return cached response if available
            if (cachedResponse) {
              return cachedResponse;
            }
            throw err;
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
