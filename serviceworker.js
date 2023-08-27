// Make a serviceworker to allow installing the app on a phone and use it offline inside this file:

const cacheName = 'scoreboard-v1'
const filesToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/main.css',
  '/images/icon.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
]

self.addEventListener('install', event => {
  console.log('Service worker installing...')
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  )
}
)

self.addEventListener('activate', event => {
  console.log('Service worker activating...')
}
)

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
}
)

// Add a manifest.json file to the root of the project with the following content:
// {
//   "name": "Scoreboard",
//   "short_name": "Scoreboard",
//   "icons": [
//     {
//       "src": "/images/icon.png",
//       "sizes": "48x48",
//       "type": "image/png"
//     },
//     {
//       "src": "/images/icon-192.png",
//       "sizes": "192x192",
//       "type": "image/png"
//     },
//     {
//       "src": "/images/icon-512.png",
//       "sizes": "512x512",
//       "type": "image/png"
//     }
//   ],
//   "start_url": "/index.html",
//   "display": "standalone",
//   "background_color": "#fff",
//   "theme_color": "#3f51b5"
// }
//
// Add the following meta tag to the head of index.html:
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
//
// Add the following link tag to the head of index.html:
// <link rel="manifest" href="/manifest.json">
//
// Add the following script tag to the bottom of index.html:
// <script>
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register("/serviceworker.js");
//   }
// </script>
//
