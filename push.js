var webPush = require('web-push');

const vapidKeys = {
   "publicKey": "BLiyKuHQmxOy4697UICQ3fjG4NLEn5YnyVZ_tETztL4GZWwA15cAjlLjzRsKpf8sm7Dsz3OSZdRfEHJHRcXCOpU",
   "privateKey": "asSJf-XSWHG0TfIoKrSGVCrf9avbFUiKOEPGrHAHtX8"
};
 
 
webPush.setVapidDetails(
   'mailto:eriawanhidayatt@gmail.com',
   vapidKeys.publicKey,
   vapidKeys.privateKey
)

var pushSubscription = {
   "endpoint": "https://fcm.googleapis.com/fcm/send/dI2VGZNVr1E:APA91bFCWyDHuXSJOyotjQdOTpfPIulgb42i4LlJui9CC57PVLElWMgglAP1hFT8iHU_ECxMc7TQ8S6qHAdCU3YnZw3ErBL99UHoabGKme82b70f2XgE_zkd8i9E4qVd5gC8v7txd1Or",
   "keys": {
       "p256dh": "BFNy5cIQ2/eObnrf6VNTwIhE2ohP7p7iwtwS9a5rUqkxcYOSgS7PBN1XH6nTAPz5LsHEpHs7d02kkdX9trooLvI=",
       "auth": "7rpm/Kb9Gegc6Zxdl4ldRg=="
   }
};

var payload = 'Selamat! Aplikasi Anda sudah dapat menerima push notifikasi!';
 
var options = {
   gcmAPIKey: '657518201338',
   TTL: 60
};
webPush.sendNotification(
   pushSubscription,
   payload,
   options
).catch(function(err){
    console.log(err);
});