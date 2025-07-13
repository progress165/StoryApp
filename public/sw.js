// public/sw.js
// Ini adalah Service Worker yang sangat dasar untuk pengujian.
// Tidak ada caching atau logika push notification di sini dulu.

self.addEventListener('install', (event) => {
    console.log('Service Worker (public/sw.js): Installing...');
    self.skipWaiting(); // Langsung aktifkan SW baru
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker (public/sw.js): Activating...');
    event.waitUntil(clients.claim()); // Ambil alih kontrol klien segera
});

self.addEventListener('fetch', (event) => {
    // Untuk saat ini, biarkan request fetch melewati Service Worker
    // Ini hanya untuk memastikan SW terdaftar dan aktif.
    // console.log('Service Worker (public/sw.js): Fetching', event.request.url);
});

console.log('Service Worker (public/sw.js) loaded.');
