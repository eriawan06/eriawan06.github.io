if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(function() {
          console.log("Pendaftaran ServiceWorker berhasil");
        })
        .catch(function() {
          console.log("Pendaftaran ServiceWorker gagal");
        });
    });
} else {
    console.log("ServiceWorker belum didukung browser ini.");
}

if ("Notification" in window) {
  requestPermission();
} else {
  console.error("Browser tidak mendukung notifikasi.");
}

// Meminta ijin menggunakan Notification API
function requestPermission() {
  Notification.requestPermission().then(function (result) {
      if (result === "denied") {
          console.log("Fitur notifikasi tidak diijinkan.");
          return;
      } else if (result === "default") {
          console.error("Pengguna menutup kotak dialog permintaan ijin.");
          return;
      }
    
      if (('PushManager' in window)) {
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array("BLiyKuHQmxOy4697UICQ3fjG4NLEn5YnyVZ_tETztL4GZWwA15cAjlLjzRsKpf8sm7Dsz3OSZdRfEHJHRcXCOpU")
            }).then(function(subscribe) {
                var endpoint = subscribe.endpoint;
                var p256dhkey =  btoa(String.fromCharCode.apply(
                  null, new Uint8Array(subscribe.getKey('p256dh'))));
                var authkey = btoa(String.fromCharCode.apply(
                  null, new Uint8Array(subscribe.getKey('auth'))));

                console.log('Berhasil melakukan subscribe dengan endpoint: ', endpoint);
                console.log('Berhasil melakukan subscribe dengan p256dh key: ', p256dhkey);
                console.log('Berhasil melakukan subscribe dengan auth key: ', authkey);
                
                // data_subscriber = {
                //   endpoint  : endpoint,
                //   p256dh    : p256dhkey,
                //   authkey   : authkey, 
                // }
                // dbInsertSubscriber(data_subscriber).then(function() {
                //   console.log("Berhasil menambahkan subscriber");
                // }).catch(function(err) {
                //   console.log("Gagal menambahkan subscriber ", err);
                // })
            }).catch(function(e) {
                console.error('Tidak dapat melakukan subscribe ', e.message);
            });
        });
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

