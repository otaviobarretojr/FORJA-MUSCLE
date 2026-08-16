const BUILD='3.4.4';
const CACHE='forja-muscle-v3-4-4';
const ASSETS=['./','./index.html','./refresh.html','./manifest.webmanifest','./assets/projecao-12-semanas.jpg','./icons/icon-192.png','./icons/icon-512.png','./fragments/home-dashboard.html','./fragments/nutrition.html','./fragments/training.html','./fragments/modals.html','./css/base.css','./css/v13.css','./css/v14.css','./css/v20.css','./css/v21.css','./css/v30.css','./css/v31.css','./css/v32.css','./css/v33.css','./css/v333.css','./css/v334.css','./css/v340.css','./css/v341.css','./css/v342.css','./js/base.js','./js/plan.js','./js/v13.js','./js/enhancements-a.js','./js/v21.js','./js/v30a.js','./js/v30b1.js','./js/v30c.js','./js/dom-fixes.js','./js/v30b2.js','./js/v31.js','./js/v32.js','./js/v33.js','./js/v332.js','./js/v333.js','./js/v334.js','./js/v340.js','./js/v341.js','./js/v342.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    const oldForjaCaches=keys.filter(k=>k.startsWith('forja-muscle-')&&k!==CACHE);
    await Promise.all(oldForjaCaches.map(k=>caches.delete(k)));
    if(self.registration.navigationPreload)await self.registration.navigationPreload.enable();
    await self.clients.claim();
    if(oldForjaCaches.length){
      const clients=await self.clients.matchAll({type:'window'});
      await Promise.all(clients.map(client=>{
        try{
          const u=new URL(client.url);
          if(u.searchParams.get('forja-updated')===BUILD)return null;
          u.searchParams.set('forja-updated',BUILD);
          return client.navigate(u.href).catch(()=>null);
        }catch(e){return null}
      }));
    }
  })());
});

async function networkFirst(req){
  const cache=await caches.open(CACHE);
  try{
    const fresh=await fetch(req,{cache:'no-store'});
    if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
    return fresh;
  }catch(err){
    return (await cache.match(req,{ignoreSearch:true})) || (await cache.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(req){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(req,{ignoreSearch:true});
  if(cached)return cached;
  try{
    const fresh=await fetch(req);
    if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
    return fresh;
  }catch(err){
    return Response.error();
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
