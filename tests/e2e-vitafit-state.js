const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function eventually(page,label,reader,predicate,attempts=40,delay=100){
  let last;
  for(let i=0;i<attempts;i++){
    last=await page.evaluate(reader);
    if(predicate(last))return last;
    await sleep(delay);
  }
  throw new Error(`${label} não atingiu o estado esperado. Último estado: ${JSON.stringify(last)}`);
}

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[];
    const bad=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400)bad.push(`${r.status()} ${r.url()}`)});
    await page.addInitScript(()=>{
      localStorage.setItem('shape12.training.cycleStart',JSON.stringify('2026-06-01'));
      localStorage.setItem('shape12.e2e.persist',JSON.stringify('ok'));
    });

    console.log('[1] Bootstrap / Home');
    await page.goto('http://127.0.0.1:4173/?e2e=state',{waitUntil:'domcontentloaded'});
    const home=await eventually(page,'bootstrap',()=>({
      ready:document.documentElement.dataset.vitafitReady,
      title:document.title,
      header:document.getElementById('vitaStableHeader')?.innerText||'',
      home:!!document.getElementById('vitaHomeDashboard'),
      cta:document.getElementById('vitaPrimaryAction')?.innerText||'',
      workout:document.getElementById('vitaWorkoutTitle')?.innerText||'',
      nav:document.querySelectorAll('.app-nav-btn').length
    }),s=>s.ready==='true'&&s.home&&s.nav===5);
    console.log(home);
    assert.match(home.title,/VITAFIT/);assert.match(home.header,/VITAFIT/);assert.match(home.workout,/(Superior|Inferior|Full Body)/);

    console.log('[2] Navegação');
    for(const id of ['treino','nutricao','evolucao','mais','hoje']){
      const state=await page.evaluate(screen=>{
        window.setAppScreen(screen,{instant:true});
        const target=screen==='hoje'?'screen-hoje':screen;
        return {active:document.getElementById(target)?.classList.contains('active')||false,nav:[...document.querySelectorAll('.app-nav-btn.active')].map(x=>x.dataset.screen)};
      },id);
      console.log(id,state);assert.equal(state.active,true);assert.deepEqual(state.nav,[id]);
    }

    console.log('[3] CTA / player guiado');
    const before=await page.evaluate(()=>({cta:document.getElementById('vitaPrimaryAction')?.innerText||''}));
    if(!/CONCLUÍDO/.test(before.cta)){
      await page.evaluate(()=>document.getElementById('vitaPrimaryAction')?.click());
      const player=await eventually(page,'player guiado',()=>{
        const w=typeof currentWorkoutDetails==='function'?currentWorkoutDetails():null;
        const active=document.querySelector('#trainingDayStage .exercise.guided-active');
        return {
          trainingActive:document.getElementById('treino')?.classList.contains('active')||false,
          workout:w,
          exerciseRows:w?.id?document.querySelectorAll(`#${w.id} .exercise[data-ex]`).length:0,
          activeKey:active?.dataset.ex||'',
          load:!!active?.querySelector('.set-load'),
          reps:!!active?.querySelector('.set-reps'),
          done:!!active?.querySelector('.set-done'),
          session:typeof dk==='function'?store.get(dk('session.running'),false):false
        };
      },s=>s.trainingActive&&s.exerciseRows>0&&s.activeKey&&s.load&&s.reps&&s.done,50,100);
      console.log(player);

      await page.evaluate(()=>{
        const active=document.querySelector('#trainingDayStage .exercise.guided-active');
        const load=active.querySelector('.set-load'),reps=active.querySelector('.set-reps');
        load.value='10';load.dispatchEvent(new Event('input',{bubbles:true}));
        reps.value='10';reps.dispatchEvent(new Event('input',{bubbles:true}));
        active.querySelector('.set-done').click();
      });
      const setState=await eventually(page,'série concluída',()=>({
        rest:!!document.querySelector('#treino .rest-mini-card.rest-mini-active'),
        done:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.done')&&localStorage.getItem(k)==='true'),
        load:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.load')&&localStorage.getItem(k)==='"10"'),
        reps:Object.keys(localStorage).some(k=>k.startsWith('shape12.day.')&&k.includes('.set.')&&k.endsWith('.reps')&&localStorage.getItem(k)==='"10"')
      }),s=>s.rest&&s.done&&s.load&&s.reps,30,100);
      console.log(setState);
    }

    console.log('[4] Programa');
    const program=await page.evaluate(()=>{window.setAppScreen('evolucao',{instant:true});return {active:document.getElementById('evolucao')?.classList.contains('active')||false,roadmap:!!document.getElementById('programRoadmap'),stages:document.querySelectorAll('.program-stage').length,label:[...document.querySelectorAll('.app-nav-btn')].find(x=>x.dataset.screen==='evolucao')?.innerText||''}});
    assert.equal(program.active,true);assert.equal(program.roadmap,true);assert.equal(program.stages,3);assert.match(program.label,/Programa/);

    console.log('[5] Nutrição');
    const nutrition=await page.evaluate(()=>{window.setAppScreen('nutricao',{instant:true});return {active:document.getElementById('nutricao')?.classList.contains('active')||false,meals:!!document.getElementById('meals'),checks:document.querySelectorAll('.meal-check').length,water:!!document.getElementById('waterNow')}});
    assert.equal(nutrition.active,true);assert.equal(nutrition.meals,true);assert.equal(nutrition.checks>0,true);assert.equal(nutrition.water,true);

    console.log('[6] Mais');
    const more=await page.evaluate(()=>{window.setAppScreen('mais',{instant:true});return {active:document.getElementById('mais')?.classList.contains('active')||false,brand:document.getElementById('vitaMoreBrand')?.innerText||'',settings:document.querySelectorAll('.settings-actions').length,exportFn:typeof window.exportData==='function'}});
    assert.equal(more.active,true);assert.match(more.brand,/VITAFIT/);assert.equal(more.settings>0,true);assert.equal(more.exportFn,true);

    console.log('[7] Reload / persistência');
    await page.reload({waitUntil:'domcontentloaded'});
    const reload=await eventually(page,'reload',()=>({ready:document.documentElement.dataset.vitafitReady,persist:localStorage.getItem('shape12.e2e.persist'),brand:document.getElementById('vitaStableHeader')?.innerText||'',home:!!document.getElementById('vitaHomeDashboard'),nav:document.querySelectorAll('.app-nav-btn').length}),s=>s.ready==='true'&&s.home&&s.nav===5);
    assert.equal(JSON.parse(reload.persist),'ok');assert.match(reload.brand,/VITAFIT/);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);assert.deepEqual(bad,[],`HTTP inválido: ${bad.join(' | ')}`);
    console.log('VITAFIT Chromium state audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
