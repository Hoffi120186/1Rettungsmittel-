const CACHE_NAME = 'offline-cache-v1';
const urlsToCache = [
  '/',                  // Startseite
  '/index.html',        // Hauptseite
  '/patient1.html',     // Beispiel-Unterseite
  '/patient2.html',     // Weitere Unterseiten
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
  '/Einstellungen.html',  // Alle Seiten, die offline verfügbar sein sollen
  '/styles.css',        // Deine CSS-Dateien
  '/app.js',            // Deine JS-Dateien
  '/icons/icon-192x192.png',  // Icons
  '/icons/icon-512x512.png'
];

// Installieren und Caching der Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Caching der Antworten und offline arbeiten
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Wenn die Anfrage im Cache ist, zurückgeben
        return cachedResponse || fetch(event.request);
      })
  );
});
