// Firebase Cloud Messaging Service Worker for Motorola 13
// Handles background push notifications, Guardian integrity alerts, and reminders

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Standard Firebase config placeholder
const firebaseConfig = {
  apiKey: "AIzaSyD-0Logik-Placeholder-Key",
  authDomain: "pi-0-logik.firebaseapp.com",
  projectId: "pi-0-logik",
  storageBucket: "pi-0-logik.appspot.com",
  messagingSenderId: "541769650027",
  appId: "1:541769650027:web:pi0logik"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background Push empfangen:', payload);
    const notificationTitle = payload.notification?.title || 'PI 0-Logik Signal';
    const notificationOptions = {
      body: payload.notification?.body || 'Nullpunkt-Synchronisation aktiv.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'pi-notification',
      vibrate: [200, 100, 200],
      data: {
        url: payload.data?.url || '/'
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('Firebase SW Fallback initialisiert (Offline-first Mode)');
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
