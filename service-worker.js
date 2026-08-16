const CACHE='forja-muscle-v3-1-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/projecao-12-semanas.jpg','./icons/icon-192.png','./icons/icon-512.png','./fragments/home-dashboard.html','./fragments/nutrition.html','./fragments/training.html','./fragments/modals.html','./css/base.css','./css/v13.css','./css/v14.css','./css/v20.css','./css/v21.css','./css/v30.css','./css/v31.css','./js/base.js','./js/plan.js','./js/v13.js','./js/enhancements-a.js','./js/v21.js','./js/v30a.js','./js/v30b1.js','./js/v30c.js','./js/dom-fixes.js','./js/v30b2.js','./js/v31.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window'});
    await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>null)));
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(async res=>{
      const cache=await caches.open(CACHE);
      cache.put('./index.html',res.clone());
      return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(req,{ignoreSearch:true});
    if(cached)return cached;
    try{
      const fresh=await fetch(req,{cache:'no-store'});
      if(fresh&&fresh.ok)cache.put(req,fresh.clone());
      return fresh;
    }catch(err){
      return cached||Response.error();
    }
  }));
});
