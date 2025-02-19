const CACHE_NAME = 'offline-cache-v1';
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
  '/patient17.html', '/patient18.html', '/patient19.html', '/patient20.html'
];

// Installieren und Caching der Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // URLs nacheinander abrufen und cachen, bei Fehlern die nicht existierenden Seiten ignorieren
      return Promise.all(
        urlsToCache.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.add(url); // Nur hinzufügen, wenn die Ressource erfolgreich abgerufen wurde
              } else {
                console.warn(`Ressource konnte nicht abgerufen werden: ${url}`);
              }
            })
            .catch((error) => {
              console.error(`Fehler beim Abrufen von ${url}:`, error);
            });
        })
      );
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

// Caching der Antworten und offline arbeiten
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request).catch(() => {
          return caches.match(OFFLINE_FALLBACK_PAGE); // Fallback bei fehlendem Cache & ohne Internet
        });
      })
  );
});
