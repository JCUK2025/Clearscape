const CACHE_NAME = 'clearscape-v1';
const urlsToCache = [
  'index.html',
  'history.html',
  'style.css',
  'main.js',
  'history.js',
  'manifest.json',
  'logo.png',
  'home-icon.png',
  'ambient.mp3',
  'positive.mp3'
];

// Install and cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key =>
        key !== CACHE_NAME ? caches.delete(key) : null
      ))
    )
  );
});

// Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});

