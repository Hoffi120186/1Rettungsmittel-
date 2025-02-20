const CACHE_NAME = 'offline-cache-v6';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// Alle URLs zum Caching hinzufügen
const urlsToCache = [
  '/', '/index.html',
  '/offline.html',
  '/Logo%20App.jpg', '/MelderVU.jpg',
  // Patientenseiten
  '/patient1.html', '/patient2.html', '/patient3.html', '/patient4.html',
  '/patient5.html', '/patient6.html', '/patient7.html', '/patient8.html',
  '/patient9.html', '/patient10.html', '/patient11.html', '/patient12.html',
  '/patient13.html', '/patient14.html', '/Status4.html', 
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  '/manifest.json',
];

// Service Worker installieren & Dateien cachen
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching der Dateien beginnt...');
      // Verwende addAll, um alle URLs auf einmal zu cachen
      return cache.addAll(urlsToCache)
        .then(() => {
          console.log('[Service Worker] Alle Dateien wurden erfolgreich gecacht');
        })
        .catch((error) => {
          console.warn('[Service Worker] Fehler beim Caching:', error);
        });
    })
  );
});

// Aktivierung & Alten Cache löschen
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktiviert');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Lösche alten Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch-Handler mit Offline-Unterstützung
self.addEventListener('fetch', (event) => {
  console.log(`[Service Worker] Fetch: ${event.request.url}`);

  event.respondWith(
   caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {

      // Wenn die Antwort aus dem Cache verfügbar ist, diese verwenden
      if (cachedResponse) {
        console.log(`[Service Worker] Antwort aus Cache: ${event.request.url}`);
        return cachedResponse;
      }

      console.log(`[Service Worker] Antwort aus Netzwerk: ${event.request.url}`);

      return fetch(event.request)
        .then((response) => {
          // Überprüfen, ob es sich um eine HTML-Seite handelt, und in den Cache speichern
          if (event.request.url.endsWith('.html')) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              console.log(`[Service Worker] Gespeichert: ${event.request.url}`);
              return response;
            });
          }

          return response; // Andere Dateitypen nicht cachen
        })
        .catch(() => {
          // Bei einem Fehler: Offline-Fallback-Seite bereitstellen
          console.warn(`[Service Worker] Netzwerkanfrage fehlgeschlagen, Offline-Fallback für: ${event.request.url}`);
          return caches.match(OFFLINE_FALLBACK_PAGE);
        });
    })
  );
});
