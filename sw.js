const CACHE = 'expenses-v5';
const FILES = ['./', './index.html', './manifest.json', './sync.js', './firebase-config.js', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Кэшируем только файлы приложения и библиотеку Firebase. Запросы к базе данных не трогаем.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const ours = url.origin === self.location.origin || url.hostname === 'www.gstatic.com';
  if (e.request.method !== 'GET' || !ours) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
