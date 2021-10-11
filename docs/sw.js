var CACHE_NAME = 'vwm-v13';
var urlsToCache = [
  './manifest.json',
  './',
  './dist/bundle.iife.css',
  './dist/bundle.iife.js',
  './dist/bundle.iife.js.map',
  './images/favicon/favicon-32x32.png',
  './images/favicon/favicon-16x16.png',
  './images/favicon/apple-touch-icon-180x180.png',
  './images/icons/192x192.png',
  './images/icons/512x512.png',
  './images/lfb_logo.gif',
  './interpolation/2021/schaele/8/fid_undefined_8.json.gzip',
  './interpolation/2021/verbiss/8/fid_undefined_8.json.gzip'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const r = await caches.match(e.request);
    if (r) { return r; }
    const response = await fetch(e.request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(e.request, response.clone());
    return response;
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === CACHE_NAME) { return; }
      return caches.delete(key);
    }))
  }));
});