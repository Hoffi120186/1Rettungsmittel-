const CACHE_NAME = 'offline-cache-v2';
const urlsToCache = [
  '/index.html',        // Hauptseite explizit angeben
  '/styles.css',       
  '/app.js',            
  '/offline.html', // Fallback-Seite für Offline-Zugriff
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Liste der Unterseiten, auch wenn sie noch nicht existieren
  '/patient1.html',
  '/patient2.html',
  '/patient3.html',
  '/patient4.html',
  '/patient5.html',
  '/patient6.html',
  '/patient7.html',
  '/patient8.html',
  '/patient9.html',
  '/patient10.html',
  '/patient11.html',
  '/patient12.html',
  '/patient13.html',
  '/patient14.html',
  '/patient15.html',
  '/patient16.html',
  '/patient17.html',
  '/patient18.html',
  '/patient19.html',
  '/patient20.html',
  '/VU Arm Spritz.jpg',
  '/VU Bauch.jpg',
  '/VU Brillenhämatom.jpg',
  '/VU Fraktur Arm.jpg',
  '/VU SHT.jpg',
  '/VU SHT2.jpg',
  '/VU Sprunggelenk.jpg',
'/VU Tod',
'/VU TOD2Thorax',
'/VU untersch.jpg',
'/VU Unterschenkel beide.jpg',
'/Mensch.jpg',
'/apple-touch-icon.png',
  '/Einstellungen.html'
];

// **Service Worker Installation & Caching**
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching URLs:', urlsToCache);
      return cache.addAll(urlsToCache)
        .then(() => {
          console.log('Alle URLs erfolgreich gecacht');
        })
        .catch((error) => {
          console.error('Fehler beim Cachen:', error);
        });
    })
  );
  self.skipWaiting(); // Service Worker direkt aktivieren
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
  self.clients.claim(); // Neuer Service Worker übernimmt sofort
});

// **Daten abrufen (Cache oder Netzwerk)**
self.addEventListener('fetch', (event) => {
  // Hier prüfen wir auf den Cache und laden die Datei aus dem Cache, wenn sie vorhanden ist
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Wenn die Antwort im Cache vorhanden ist, gib sie zurück
        if (response) {
          console.log('Antwort aus dem Cache:', event.request.url);
          return response;
        } else {
          // Wenn die Antwort nicht im Cache ist, versuche sie aus dem Netzwerk zu laden
          console.log('Datei aus dem Netzwerk abrufen:', event.request.url);
          return fetch(event.request)
            .then((networkResponse) => {
              // Überprüfe die Antwort des Netzwerks
              if (!networkResponse || networkResponse.status !== 200) {
                console.error('Fehler beim Abrufen aus dem Netzwerk:', event.request.url);
                return caches.match('/offline.html'); // Zeige die Offline-Seite, wenn der Abruf fehlschlägt
              }

              // Caching der erfolgreichen Antwort
              const clonedResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
              return networkResponse;
            })
            .catch((error) => {
              console.error('Fehler beim Abrufen aus dem Netzwerk:', error);
              return caches.match('/offline.html'); // Offline-Seite anzeigen, wenn der Abruf fehlschlägt
            });
        }
      })
      .catch((error) => {
        console.error('Fehler im Fetch-Event:', error);
        return caches.match('/offline.html'); // Fallback, wenn es einen Fehler gibt
      })
  );
});
