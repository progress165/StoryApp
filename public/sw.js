
self.addEventListener('install', (event) => {
    console.log('Service Worker (public/sw.js): Installing...');
    self.skipWaiting(); // Langsung aktifkan SW baru
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker (public/sw.js): Activating...');
    event.waitUntil(clients.claim()); // Ambil alih kontrol klien segera
});

self.addEventListener('fetch', (event) => {

});

console.log('Service Worker (public/sw.js) loaded.');
