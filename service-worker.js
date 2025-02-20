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

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map(url => {
          return fetch(url)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                console.warn(`[Service Worker] Nicht gecacht: ${url} (Status: ${response.status})`);
                return;
              }
              return cache.put(url, response.clone());
            })
            .catch(error => {
              console.warn(`[Service Worker] Fehler beim Cachen von ${url}:`, error);
            });
        })
      );
    })
  );
});

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

self.addEventListener('fetch', (event) => {
  console.log(`[Service Worker] Fetch: ${event.request.url}`);
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log(`[Service Worker] Antwort aus Cache: ${event.request.url}`);
            return cachedResponse;
          }
          console.warn(`[Service Worker] Netzwerkanfrage fehlgeschlagen, Offline-Fallback: ${event.request.url}`);
          return caches.match(OFFLINE_FALLBACK_PAGE);
        });
      })
  );
});
