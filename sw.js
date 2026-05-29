const CACHE = 'family-expense-v4';
const ASSETS = [
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // HTML — network first, fallback to cache (ได้ version ล่าสุดเสมอ)
  if (e.request.destination === 'document' || url.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => { const c = res.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); return res; })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // CDN scripts & assets — cache first (เร็ว + ใช้ออฟไลน์ได้)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const c = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, c));
      return res;
    }))
  );
});
