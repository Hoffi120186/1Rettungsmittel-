const CACHE_NAME = 'offline-cache-v2';
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/patient1.html', '/patient2.html', '/patient3.html', '/patient4.html',
  '/patient5.html', '/patient6.html', '/patient7.html', '/patient8.html',
  '/patient9.html', '/patient10.html', '/patient11.html', '/patient12.html',
  '/patient13.html', '/patient14.html', '/patient15.html', '/patient16.html',
  '/patient17.html', '/patient18.html', '/patient19.html', '/patient20.html',
  '/VU Arm Spritz.jpg', '/VU Bauch.jpg', '/VU Brillenhämatom.jpg',
  '/VU Fraktur Arm.jpg', '/VU SHT.jpg', '/VU SHT2.jpg', '/VU Sprunggelenk.jpg',
  '/VU Tod.jpg', '/VU TOD2Thorax.jpg', '/VU untersch.jpg', '/VU Unterschenkel beide.jpg',
  '/Mensch.jpg', '/apple-touch-icon.png', '/Einstellungen.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const validUrls = [];

      for (const url of urlsToCache) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            validUrls.push(url);
          } else {
            console.warn(`Fehlende Datei übersprungen: ${url}`);
          }
        } catch (error) {
          console.warn(`Fehlende Datei übersprungen: ${url}`);
        }
      }

      await cache.addAll(validUrls);
      console.log('Caching abgeschlossen');
    })()
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('Antwort aus dem Cache:', event.request.url);
        return response;
      } else {
        console.log('Datei aus dem Netzwerk abrufen:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              console.error('Fehler beim Abrufen aus dem Netzwerk:', event.request.url);
              return caches.match('/offline.html');
            }
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fehler beim Abrufen aus dem Netzwerk:', error);
            return caches.match('/offline.html');
          });
      }
    }).catch((error) => {
      console.error('Fehler im Fetch-Event:', error);
      return caches.match('/offline.html');
    })
  );
});
