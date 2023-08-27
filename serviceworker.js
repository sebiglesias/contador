// Make a serviceworker to allow installing the app on a phone and use it offline inside this file:

const cacheName = 'scoreboard-v1'
const filesToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/main.css',
  '/images/icon.png',
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
