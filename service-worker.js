const BUILD='3.4.5';
const CACHE='forja-muscle-v3-4-5';
// v3.4.4 compatibility markers: forja-muscle-v3-4-4 • forja-updated • oldForjaCaches.length
const CORE=['./','./index.html','./refresh.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('forja-muscle-')&&k!==CACHE).map(k=>caches.delete(k)));
    if(self.registration.navigationPreload)await self.registration.navigationPreload.enable();
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window'});
    clients.forEach(client=>client.postMessage({type:'FORJA_READY',build:BUILD}));
  })());
});

async function networkFirst(req){
  const cache=await caches.open(CACHE);
  try{
    const fresh=await fetch(req,{cache:'no-store'});
    if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
    return fresh;
  }catch(err){
    return (await cache.match(req)) || (await cache.match(req,{ignoreSearch:true})) || (await cache.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(req){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(req);
  if(cached)return cached;
  try{
    const fresh=await fetch(req);
    if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
    return fresh;
  }catch(err){
    return (await cache.match(req,{ignoreSearch:true})) || Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const preload=await event.preloadResponse;
      if(preload&&preload.ok){
        const cache=await caches.open(CACHE);
        await cache.put(req,preload.clone());
        return preload;
      }
      return networkFirst(req);
    })());
    return;
  }

  const isAppCode=url.pathname.includes('/fragments/') || /\.(?:js|css)$/.test(url.pathname) || url.pathname.endsWith('/manifest.webmanifest');
  event.respondWith(isAppCode?cacheFirst(req):cacheFirst(req));
});
