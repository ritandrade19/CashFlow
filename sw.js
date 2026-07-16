const CACHE = 'cashflow-v3';
const ASSETS = [
  '/CashFlow/',
  '/CashFlow/index.html'
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

  // NUNCA interceptar pedidos à API ou externos — deixa passar sempre
  if (url.includes('onrender.com') ||
      url.includes('supabase.co') ||
      url.includes('googleapis.com') ||
      url.includes('script.google.com') ||
      !url.includes('github.io')) {
    return; // não faz nada, o browser trata normalmente
  }

  // Para ficheiros locais — cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      });
    })
  );
});
