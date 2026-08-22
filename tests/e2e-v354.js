const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function eventually(page,reader,predicate,attempts=50){
  let last;
  for(let i=0;i<attempts;i++){
    last=await page.evaluate(reader);
    if(predicate(last))return last;
    await sleep(100);
  }
  throw new Error(`Estado esperado não atingido: ${JSON.stringify(last)}`);
}

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus'});
    const page=await context.newPage();
    const errors=[];const bad=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400)bad.push(`${r.status()} ${r.url()}`)});
    await page.goto('http://127.0.0.1:4173/?e2e=v354',{waitUntil:'domcontentloaded'});
    await eventually(page,()=>({ready:document.documentElement.dataset.vitafitReady,build:document.documentElement.dataset.forjaBuild}),s=>s.ready==='true'&&s.build==='3.5.4');

    const expected=[
      ['2026-08-24T12:00:00-04:00','workout-seg',5,'Inferiores completo'],
      ['2026-08-25T12:00:00-04:00','workout-ter',5,'Superiores completo'],
      ['2026-08-26T12:00:00-04:00','workout-qua',6,'Inferiores completo'],
      ['2026-08-27T12:00:00-04:00','workout-qui',5,'Superiores completo'],
      ['2026-08-28T12:00:00-04:00','workout-sex',6,'Inferiores completo']
    ];
    for(const [iso,id,count,name] of expected){
      const state=await page.evaluate(({iso,id})=>{
        selectedDate=new Date(iso);
        if(typeof renderAll==='function')renderAll();
        const w=currentWorkoutDetails();
        return {id:w.id,name:w.name,count:document.querySelectorAll(`#${id} .exercise[data-ex]`).length,demos:document.querySelectorAll(`#${id} .exercise-demo-btn`).length};
      },{iso,id});
      assert.equal(state.id,id);assert.equal(state.name,name);assert.equal(state.count,count);assert.equal(state.demos,count);
    }

    await page.evaluate(()=>{
      selectedDate=new Date('2026-08-24T12:00:00-04:00');
      renderAll();
      window.setAppScreen('treino',{instant:true});
      document.querySelector('#workout-seg .exercise-demo-btn').click();
    });
    const video=await eventually(page,()=>({open:document.getElementById('forjaVideoModal')?.classList.contains('open')||false,src:document.getElementById('forjaDemoVideo')?.src||'',title:document.getElementById('forjaVideoTitle')?.textContent||''}),s=>s.open&&s.src.startsWith('blob:')&&/Agachamento sumô/.test(s.title));
    assert.equal(video.open,true);

    const ui=await page.evaluate(()=>({version:document.querySelector('#vitaStableHeader .version')?.textContent||'',schedule:document.querySelectorAll('#schedule .day').length,cardio:document.getElementById('cardioRows')?.innerText||''}));
    assert.match(ui.version,/3\.5\.4/);assert.equal(ui.schedule,7);assert.match(ui.cardio,/Segunda/);assert.match(ui.cardio,/Terça/);assert.match(ui.cardio,/Quinta/);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);assert.deepEqual(bad,[],`HTTP inválido: ${bad.join(' | ')}`);
    console.log('VITAFIT v3.5.4 workout browser audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
