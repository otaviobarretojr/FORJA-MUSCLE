const CACHE='forja-muscle-v3';
const ASSETS=["./", "./index.html", "./manifest.webmanifest", "./assets/projecao-12-semanas.jpg", "./icons/icon-192.png", "./icons/icon-512.png", "./fragments/01-home.html", "./fragments/02-daily-dashboard.html", "./fragments/03-nav-nutrition.html", "./fragments/04-training.html", "./fragments/05-modals.html", "./css/base.css", "./css/v13.css", "./css/v14.css", "./css/v20.css", "./css/v21.css", "./css/v30.css", "./js/base.js", "./js/v13.js", "./js/v14.js", "./js/v20.js", "./js/v21.js", "./js/v30.js"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html')))));
