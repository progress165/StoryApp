// src/sw-custom-events.js
// File ini berisi logika kustom Service Worker yang akan diimpor oleh Workbox GenerateSW

// --- PUSH NOTIFICATION: Handler Push Event ---
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received!');
    let notificationData = {};
    try {
        if (event.data) {
            notificationData = event.data.json();
        }
    } catch (e) {
        console.error('Failed to parse push data as JSON:', e);
        notificationData = { title: 'New Notification', body: event.data.text() || 'You have a new update!' };
    }

    const title = notificationData.title || 'Story App Notification';
    const options = {
        // --- PERBAIKAN DI SINI! Hindari Optional Chaining ---
        body: (notificationData.options && notificationData.options.body) ? notificationData.options.body : 'You have a new update!',
        // --- AKHIR PERBAIKAN ---
        icon: notificationData.icon || '/images/icons/icon-192x192.png',
        badge: notificationData.badge || '/images/icons/icon-72x72.png',
        data: {
            url: notificationData.url || '/',
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// --- PUSH NOTIFICATION: Handler Notification Click Event ---
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked!', event.notification);
    event.notification.close();

    const clickedNotificationUrl = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === clickedNotificationUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(clickedNotificationUrl);
            }
            return null;
        })
    );
});
