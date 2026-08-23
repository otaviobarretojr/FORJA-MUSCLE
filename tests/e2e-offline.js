const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:4173/';
const CACHE='forja-muscle-v3-6-6-vitafit-clean-core';

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(()=>localStorage.setItem('shape12.e2e.offlinePersist',JSON.stringify('preservado')));

    await page.goto(`${BASE}?e2e=offline-v366`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>navigator.serviceWorker.controller?.state==='activated',null,{timeout:15000});

    const prepared=await page.evaluate(async cacheName=>{
      const reg=await navigator.serviceWorker.ready,cache=await caches.open(cacheName),requests=await cache.keys();
      return {active:!!reg.active,controller:!!navigator.serviceWorker.controller,cacheNames:await caches.keys(),urls:requests.map(r=>r.url),build:document.documentElement.dataset.vitafitBuild,fastNav:window.setAppScreen?.__vitafitFast===true};
    },CACHE);
    assert.equal(prepared.active,true);assert.equal(prepared.controller,true);assert.equal(prepared.build,'3.6.6');assert.equal(prepared.fastNav,true);assert.ok(prepared.cacheNames.includes(CACHE));
    for(const suffix of ['/index.html','/fragments/home-dashboard.html','/fragments/nutrition.html','/fragments/training.html','/fragments/modals.html','/css/v366.css','/js/v360.js','/js/v363.js','/js/v366.js'])assert.ok(prepared.urls.some(url=>new URL(url).pathname.endsWith(suffix)),`arquivo não pré-cacheado: ${suffix}`);

    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});
    const home=await page.evaluate(()=>({online:navigator.onLine,controller:!!navigator.serviceWorker.controller,build:document.documentElement.dataset.vitafitBuild,home:!!document.getElementById('vitaHomeDashboard'),nav:document.querySelectorAll('.app-nav-btn').length,fastNav:window.setAppScreen?.__vitafitFast===true,persisted:localStorage.getItem('shape12.e2e.offlinePersist')}));
    assert.equal(home.online,false);assert.equal(home.controller,true);assert.equal(home.build,'3.6.6');assert.equal(home.home,true);assert.equal(home.nav,3);assert.equal(home.fastNav,true);assert.equal(JSON.parse(home.persisted),'preservado');

    for(const id of ['treino','mais','hoje']){
      await page.evaluate(id=>window.setAppScreen(id,{instant:true}),id);
      const active=await page.evaluate(id=>document.getElementById(id==='hoje'?'screen-hoje':id)?.classList.contains('active')||false,id);
      assert.equal(active,true,`${id} não abriu offline`);
    }
    for(const retired of ['nutricao','evolucao']){
      await page.evaluate(id=>window.setAppScreen(id,{instant:true}),retired);
      assert.equal(await page.evaluate(()=>document.getElementById('screen-hoje')?.classList.contains('active')||false),true,`${retired} não redirecionou para Hoje`);
    }

    const resources=await page.evaluate(async()=>{
      const urls=['fragments/home-dashboard.html?v=3.6.6','fragments/nutrition.html?v=3.6.6','fragments/training.html?v=3.6.6','fragments/modals.html?v=3.6.6','css/v366.css?v=3.6.6','js/v360.js?v=3.6.6','js/v363.js?v=3.6.6','js/v366.js?v=3.6.6'];
      const out=[];for(const url of urls){try{const r=await fetch(url);out.push({url,ok:r.ok,status:r.status})}catch(e){out.push({url,ok:false,status:0,error:String(e)})}}return out;
    });
    for(const resource of resources)assert.equal(resource.ok,true,`recurso offline indisponível: ${JSON.stringify(resource)}`);
    assert.deepEqual(errors,[],`Erros JS durante auditoria offline: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.6 offline reload audit: OK');
  } finally {await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});
