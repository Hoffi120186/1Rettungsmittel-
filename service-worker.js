const CACHE_NAME = 'offline-cache-v6';
const OFFLINE_FALLBACK_PAGE = '/offline.html';

const urlsToCache = [
  '/', '/index.html', '/Einstellungen.html',
  '/styles.css', '/app.js',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  '/offline.html',
  '/Logo%20App.jpg', '/MelderVU.jpg',
  // Patientenseiten
  '/patient1.html', '/patient2.html', '/patient3.html', '/patient4.html',
  '/patient5.html', '/patient6.html', '/patient7.html', '/patient8.html',
  '/patient9.html', '/patient10.html', '/patient11.html', '/patient12.html',
  '/patient13.html', '/patient14.html', '/patient15.html', '/patient16.html',
  '/patient17.html', '/patient18.html', '/patient19.html', '/patient20.html',
  '/Status4.html'
];

// Service Worker installieren & Dateien cachen
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching der Dateien beginnt...');
      
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          await cache.put(url, response);
          console.log(`[Service Worker] Gespeichert: ${url}`);
        } catch (error) {
          console.warn(`[Service Worker] Fehler beim Cachen von ${url}:`, error);
        }
      }
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
            console.log("[Service Worker] Lösche alten Cache:", cache);
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
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log(`[Service Worker] Antwort aus Cache: ${event.request.url}`);
        return cachedResponse;
      }

      console.log(`[Service Worker] Antwort aus Netzwerk: ${event.request.url}`);
      return fetch(event.request)
        .then((response) => {
          // Überprüfen, ob es sich um eine HTML-Seite handelt
          if (event.request.url.endsWith('.html')) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              console.log(`[Service Worker] Gespeichert: ${event.request.url}`);
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          console.warn(`[Service Worker] Netzwerkanfrage fehlgeschlagen, Offline-Fallback für: ${event.request.url}`);
          return caches.match(OFFLINE_FALLBACK_PAGE);
        });
    })
  );
});
