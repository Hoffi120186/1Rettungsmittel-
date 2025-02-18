const CACHE_NAME = 'offline-cache-v2';
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/Einstellungen.html',
  '/Mensch.jpg',
  '/apple-touch-icon.png',
  '/VU Arm Spritz.jpg',
  '/VU Bauch.jpg',
  '/VU Brillenhämatom.jpg',
  '/VU Fraktur Arm.jpg',
  '/VU SHT.jpg',
  '/VU SHT2.jpg',
  '/VU Sprunggelenk.jpg',
  '/VU Tod.jpg',
  '/VU TOD2Thorax.jpg',
  '/VU untersch.jpg',
  '/VU Unterschenkel beide.jpg',
  ...Array.from({ length: 20 }, (_, i) => `/patient${i + 1}.html`)
];

// **Service Worker Installation & Caching**
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all(
      urlsToCache.map(url =>
        fetch(url, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              return caches.open(CACHE_NAME).then(cache => cache.add(url));
            } else {
              console.warn(`Fehlende Datei übersprungen: ${url}`);
            }
          })
          .catch(() => console.warn(`Fehlende Datei übersprungen: ${url}`))
      )
    ).then(() => console.log('Caching abgeschlossen'))
  );
  self.skipWaiting();
});

// **Alte Caches löschen, wenn eine neue Version verfügbar ist**
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// **Daten abrufen (Cache oder Netzwerk)**
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Antwort aus dem Cache:', event.request.url);
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              console.error('Fehler beim Abrufen:', event.request.url);
              return caches.match('/offline.html');
            }
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => caches.match('/offline.html'));
      })
  );
});
