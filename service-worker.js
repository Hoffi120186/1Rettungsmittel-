const CACHE_NAME = 'offline-cache-v2'; // Version aktualisieren, damit alte Caches gelöscht werden
const OFFLINE_FALLBACK_PAGE = '/offline.html';  // Fallback-Seite

const urlsToCache = [
  '/', '/index.html', '/Einstellungen.html',
  '/styles.css', '/app.js',
  '/icons/icon-192x192.png', '/icons/icon-512x512.png',
  '/offline.html', // Wichtig für Offline-Fallback
  // Deine Patientenseiten
  '/patient1.html', '/patient2.html', '/patient3.html', '/patient4.html',
  '/patient5.html', '/patient6.html', '/patient7.html', '/patient8.html',
  '/patient9.html', '/patient10.html', '/patient11.html', '/patient12.html',
  '/patient13.html', '/patient14.html', '/patient15.html', '/patient16.html',
  '/patient17.html', '/patient18.html', '/patient19.html', '/patient20.html',
  '/Status4.html'
];

// Installieren und Caching der Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn("Einige Ressourcen konnten nicht gecacht werden:", error);
      });
    })
  );
});

// Aktivierung: Alten Cache löschen, wenn Version geändert wird
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Alten Cache löschen:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch-Event: Holt Ressourcen aus dem Cache oder speichert neue Inhalte
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Falls im Cache, direkt liefern
      }
      return fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone()); // Neue Datei speichern
            return response;
          });
        })
        .catch(() => {
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_FALLBACK_PAGE); // Zeige Offline-Seite für HTML
          }
        });
    })
  );
});
