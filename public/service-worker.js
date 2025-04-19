// service-worker.js
self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    var data = {};
    if (event.data) {
        data = event.data.json();
    }

    var title = data.title || 'New Transaction Alert';
    var message = data.message || 'A new transaction requires your attention.';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: message,
            icon: 'path/to/your/icon.png',
            vibrate: [200, 100, 200],
            tag: 'transaction-notification',
            renotify: true
        })
    );
});
