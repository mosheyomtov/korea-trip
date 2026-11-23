// Network first: every open checks GitHub for the latest version (bypassing the browser's 10-minute cache),
// and the last copy is kept so the app still opens with no internet (useful abroad).
const CACHE = 'trips-v12';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|unpkg\.com/.test(url.host);
  if (!cacheable) return;
  e.respondWith(
    fetch(req, url.origin === location.origin ? { cache: 'no-cache' } : undefined).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./')))
  );
});
