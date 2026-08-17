const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:4173/';
const CACHE='forja-muscle-v3-5-2-vitafit-offline';

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:412,height:915}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(()=>{
      localStorage.setItem('shape12.training.cycleStart',JSON.stringify('2026-06-01'));
      localStorage.setItem('shape12.e2e.offlinePersist',JSON.stringify('preservado'));
    });

    console.log('[OFFLINE 1] Uma única abertura com internet');
    await page.goto(`${BASE}?e2e=offline-first`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000});

    const prepared=await page.evaluate(async cacheName=>{
      const reg=await navigator.serviceWorker.ready;
      const cache=await caches.open(cacheName);
      const requests=await cache.keys();
      return {
        active:!!reg.active,
        activeState:reg.active?.state||'',
        controller:!!navigator.serviceWorker.controller,
        cacheNames:await caches.keys(),
        urls:requests.map(r=>r.url),
        build:document.documentElement.dataset.vitafitBuild||document.documentElement.dataset.forjaBuild
      };
    },CACHE);

    assert.equal(prepared.active,true,'service worker não ficou ativo após o primeiro carregamento');
    assert.equal(prepared.activeState,'activated');
    assert.equal(prepared.controller,true,'primeira página não foi assumida pelo service worker após o cache');
    assert.equal(prepared.build,'3.5.2');
    assert.ok(prepared.cacheNames.includes(CACHE),`cache ${CACHE} não foi criado`);
    for(const suffix of [
      '/index.html',
      '/fragments/home-dashboard.html',
      '/fragments/nutrition.html',
      '/fragments/training.html',
      '/fragments/modals.html',
      '/css/v351-accessibility.css',
      '/js/v351.js',
      '/assets/projecao-12-semanas.jpg'
    ]){
      assert.ok(prepared.urls.some(url=>new URL(url).pathname.endsWith(suffix)),`arquivo não pré-cacheado: ${suffix}`);
    }
    console.log({active:prepared.active,activeState:prepared.activeState,controller:prepared.controller,cached:prepared.urls.length});

    console.log('[OFFLINE 2] Corta a internet e faz uma recarga completa');
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded',timeout:20000});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true',null,{timeout:20000});

    const home=await page.evaluate(()=>({
      online:navigator.onLine,
      controller:!!navigator.serviceWorker.controller,
      ready:document.documentElement.dataset.vitafitReady,
      build:document.documentElement.dataset.vitafitBuild||document.documentElement.dataset.forjaBuild,
      title:document.title,
      home:!!document.getElementById('vitaHomeDashboard'),
      nav:document.querySelectorAll('.app-nav-btn').length,
      persisted:localStorage.getItem('shape12.e2e.offlinePersist')
    }));
    assert.equal(home.online,false);
    assert.equal(home.controller,true,'recarga offline não ficou sob controle do service worker');
    assert.equal(home.ready,'true');
    assert.equal(home.build,'3.5.2');
    assert.equal(home.home,true);
    assert.equal(home.nav,5);
    assert.equal(JSON.parse(home.persisted),'preservado');
    assert.match(home.title,/VITAFIT/);

    console.log('[OFFLINE 3] Navegação interna sem rede');
    const screens=await page.evaluate(()=>{
      const result={};
      for(const id of ['evolucao','nutricao','mais','treino','hoje']){
        window.setAppScreen(id,{instant:true});
        result[id]=document.getElementById(id==='hoje'?'screen-hoje':id)?.classList.contains('active')||false;
      }
      return result;
    });
    assert.equal(screens.evolucao,true);
    assert.equal(screens.nutricao,true);
    assert.equal(screens.mais,true);
    assert.equal(screens.treino,true);
    assert.equal(screens.hoje,true);

    console.log('[OFFLINE 4] Recursos locais disponíveis pelo cache');
    const resources=await page.evaluate(async()=>{
      const urls=[
        'fragments/home-dashboard.html?v=3.5.2',
        'fragments/nutrition.html?v=3.5.2',
        'fragments/training.html?v=3.5.2',
        'fragments/modals.html?v=3.5.2',
        'css/v351-accessibility.css?v=3.5.2',
        'js/v351.js?v=3.5.2',
        'assets/projecao-12-semanas.jpg'
      ];
      const out=[];
      for(const url of urls){
        try{
          const r=await fetch(url);
          out.push({url,ok:r.ok,status:r.status});
        }catch(e){out.push({url,ok:false,status:0,error:String(e)})}
      }
      return out;
    });
    for(const resource of resources)assert.equal(resource.ok,true,`recurso offline indisponível: ${JSON.stringify(resource)}`);

    assert.deepEqual(errors,[],`Erros JS durante auditoria offline: ${errors.join(' | ')}`);
    console.log({home,screens,resources});
    console.log('VITAFIT offline reload audit: OK');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});