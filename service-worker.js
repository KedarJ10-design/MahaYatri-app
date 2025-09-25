// This service worker is now configured for Firebase Cloud Messaging (FCM).

importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

let firebaseInitialized = false;

// Listen for the configuration message from the main application thread.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_FIREBASE_CONFIG') {
        if (!firebaseInitialized) {
            initializeFirebase(event.data.config);
            firebaseInitialized = true;
        }
    }
});

function initializeFirebase(firebaseConfig) {
    // A simple check to ensure the config has been provided.
    if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("VITE_")) {
        console.error("Firebase config not received or invalid in service-worker.js. Push notifications will not work.");
        return;
    }
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // --- BACKGROUND MESSAGE HANDLER ---
    messaging.onBackgroundMessage((payload) => {
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png',
        data: { url: payload.fcmOptions.link }
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
}


// --- NOTIFICATION CLICK HANDLER ---
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url;
    event.waitUntil(clients.openWindow(urlToOpen || '/'));
});


// --- Standard Service Worker Lifecycle (for offline caching) ---
const STATIC_CACHE_NAME = 'mahayatri-static-v2';
const DYNAMIC_CACHE_NAME = 'mahayatri-dynamic-v2';

const APP_SHELL_ASSETS = [ '/', '/index.html', 'https://cdn.tailwindcss.com' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebase')) return;
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          if (fetchRes.ok) {
            cache.put(event.request.url, fetchRes.clone());
          }
          return fetchRes;
        })
      });
    })
  );
});
