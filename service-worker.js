const CACHE_NAME = 'offline-cache-v6';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

const urlsToCache = [
  '/', '/index.html', '/Einstellungen.html',
  '/styles.css', '/app.js',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  '/offline.html',
  '/Logo%20App.jpg', '/MelderVU.jpg',
  // Patientenseiten
  '/Patient1.html', '/Patient2.html', '/Patient3.html', '/Patient4.html',
  '/Patient5.html', '/Patient6.html', '/Patient7.html', '/Patient8.html',
  '/Patient9.html', '/Patient10.html', '/Patient11.html', '/Patient12.html',
  '/Patient13.html', '/Patient14.html', '/Patient15.html', '/Patient16.html',
  '/Patient17.html', '/Patient18.html', '/Patient19.html', '/Patient20.html',
  '/Status4.html'
];

// 🔵 INSTALL-EVENT → Dateien zwischenspeichern
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching startet...');
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting(); // Service Worker sofort aktivieren
});

// 🟢 ACTIVATE → Alten Cache löschen und neuen aktivieren
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktiviert');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Lösche alten Cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim(); // Sofort Kontrolle über alle Seiten übernehmen
});

// 🟡 FETCH → Offline-Verhalten verbessern
self.addEventListener('fetch', (event) => {
  console.log(`[Service Worker] Fetch: ${event.request.url}`);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[Service Worker] Antwort aus Cache: ${event.request.url}`);
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            throw new Error("Netzwerkantwort ungültig");
          }

          // Gecachte Dateien beim ersten Abruf speichern
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            console.log(`[Service Worker] Ressource gespeichert: ${event.request.url}`);
            return networkResponse;
          });
        })
        .catch(() => {
          console.warn(`[Service Worker] Netzwerkanfrage fehlgeschlagen, Offline-Fallback für: ${event.request.url}`);
          return caches.match(OFFLINE_FALLBACK_PAGE);
        });
    })
  );
});
