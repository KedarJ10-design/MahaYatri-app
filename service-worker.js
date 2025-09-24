// MahaYatri Service Worker

const STATIC_CACHE_NAME = 'mahayatri-static-v1';
const DYNAMIC_CACHE_NAME = 'mahayatri-dynamic-v1';

// App Shell: Files that are essential for the app to run.
// These are cached on installation.
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx', // In this setup, the TSX is served directly.
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Poppins:wght@300;400;600;700;800&display=swap'
];

// --- SERVICE WORKER LIFECYCLE ---

// 1. Install: Cache the App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
});

// 2. Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- FETCH EVENT HANDLING ---

// 3. Fetch: Serve from cache, fallback to network, and update dynamic cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore requests to Firebase services, as they have their own offline handling.
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore.googleapis.com')) {
    return;
  }
  
  // Ignore Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Strategy: Cache-First for static assets (App Shell)
  if (APP_SHELL_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }
  
  // Strategy: Cache-First for images and fonts, with network fallback and cache update
  if (url.hostname.includes('picsum.photos') || url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              // Check if the response is valid before caching
              if (networkResponse.ok) {
                 cache.put(request.url, networkResponse.clone());
              }
              return networkResponse;
            });
          });
        })
      );
      return;
  }

  // Default: Network-first for everything else
  event.respondWith(
    fetch(request).catch(() => {
      // Fallback for when network fails.
      // Could return a generic offline page here if needed.
    })
  );
});