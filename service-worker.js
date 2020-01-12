importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox)
  console.log(`Workbox berhasil dimuat`);
else
  console.log(`Workbox gagal dimuat`);

workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1'},
  { url: '/manifest.json', revision: '1'},
  { url: '/index.html', revision: '1'},
  { url: '/navlist.html', revision: '1'},
  { url: '/pages/home.html', revision: '1'},
  { url: '/pages/fixture.html', revision: '1'},
  { url: '/pages/standing.html', revision: '1'},
  { url: '/pages/teams.html', revision: '1'},
  { url: '/pages/favteams.html', revision: '1'},
  { url: '/pages/admin.html', revision: '1'},
  { url: '/pages/detailnews.html', revision: '1'},
  { url: '/assets/css/materialize.css', revision: '1'},
  { url: '/assets/css/materialize.min.css', revision: '1'},
  { url: '/assets/css/styles.css', revision: '1'},
  { url: '/assets/css/spacing.css', revision: '1'},
  { url: '/assets/js/materialize.js', revision: '1'},
  { url: '/assets/js/materialize.min.js', revision: '1'},
  { url: '/assets/js/jquery-3.4.1.js', revision: '1'},
  { url: '/assets/js/idb.js', revision: '1'},
  { url: '/assets/js/contents.js', revision: '1'},
  { url: '/assets/js/register-service-worker.js', revision: '1'},
  { url: '/assets/js/api.js', revision: '1'},
  { url: '/assets/js/db.js', revision: '1'},
  { url: '/assets/img/logo-not-found.png', revision: '1'},
  { url: '/assets/img/jadwal.png', revision: '1'},
  { url: '/assets/img/tlcom.png', revision: '1'},
  { url: '/assets/img/tlcom192.png', revision: '1'},
]);

workbox.routing.registerRoute(
  new RegExp('https://api.football-data.org/v2/'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'footballData',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 30,
      }),
    ]
  })
);

self.addEventListener('push', function(event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'Push message no payload';
  }
  var options = {
    body: body,
    // icon: 'img/notification.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});