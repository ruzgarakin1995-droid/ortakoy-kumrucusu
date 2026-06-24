self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Offline-first is not fully implemented here as it requires caching logic,
  // but this basic pass-through is enough to trigger the PWA install prompt.
  event.respondWith(fetch(event.request));
});
