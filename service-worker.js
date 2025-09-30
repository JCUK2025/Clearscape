// service-worker.js

// Define the name of the cache for version control
const CACHE_NAME = 'clearscape-cache-v1';

// List all files needed for the app to run offline
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/clearscape_logo.png', // Your main logo
    // PWA Icons (Essential for Home Screen Install)
    '/app_icon_192.png',
    '/app_icon_512.png',
    '/apple_touch_icon.png' 
];

// 1. Install Event: Caching the App Shell
self.addEventListener('install', event => {
  // Wait until all essential files are downloaded and cached
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching essential assets.');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event: Serving cached assets first (Cache-First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If resource is in cache, return it immediately (enables offline mode)
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network
        return fetch(event.request);
      }
    )
  );
});

// 3. Activate Event: Cleaning up Old Caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any caches not in the current CACHE_NAME list
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
