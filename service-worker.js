const CACHE='forja-muscle-v3-4-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/projecao-12-semanas.jpg','./icons/icon-192.png','./icons/icon-512.png','./fragments/home-dashboard.html','./fragments/nutrition.html','./fragments/training.html','./fragments/modals.html','./css/base.css','./css/v13.css','./css/v14.css','./css/v20.css','./css/v21.css','./css/v30.css','./css/v31.css','./css/v32.css','./css/v33.css','./css/v333.css','./css/v334.css','./css/v340.css','./css/v341.css','./js/base.js','./js/plan.js','./js/v13.js','./js/enhancements-a.js','./js/v21.js','./js/v30a.js','./js/v30b1.js','./js/v30c.js','./js/dom-fixes.js','./js/v30b2.js','./js/v31.js','./js/v32.js','./js/v33.js','./js/v332.js','./js/v333.js','./js/v334.js','./js/v340.js','./js/v341.js'];

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

async function networkFirst(req){
  const cache=await caches.open(CACHE);
  try{
    const fresh=await fetch(req,{cache:'no-store'});
    if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
    return fresh;
  }catch(err){
    return (await cache.match(req,{ignoreSearch:true})) || Response.error();
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
    event.respondWith(cacheFirst(req).then(res=>res&&res.ok?res:caches.match('./index.html')));
    return;
  }

  const isAppCode=url.pathname.includes('/fragments/') || /\.(?:js|css)$/.test(url.pathname) || url.pathname.endsWith('/manifest.webmanifest');
  event.respondWith(isAppCode?cacheFirst(req):cacheFirst(req));
});
