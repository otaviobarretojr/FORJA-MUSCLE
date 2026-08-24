const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus',hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/?e2e=v367',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true'&&document.getElementById('v360TrainingApp'));

    const boot=await page.evaluate(()=>({
      build:document.documentElement.dataset.vitafitBuild,
      nav:document.querySelectorAll('.app-nav-btn').length,
      nutritionNav:!!document.querySelector('.app-nav-btn[data-screen="nutricao"]'),
      programNav:!!document.querySelector('.app-nav-btn[data-screen="evolucao"]'),
      fast:window.setAppScreen?.__vitafitFast===true
    }));
    assert.equal(boot.build,'3.6.7');assert.equal(boot.nav,3);assert.equal(boot.nutritionNav,false);assert.equal(boot.programNav,false);assert.equal(boot.fast,true);

    await page.evaluate(()=>window.setAppScreen('treino',{instant:true}));
    await page.waitForFunction(()=>document.getElementById('treino')?.classList.contains('active')&&document.querySelectorAll('#v360TrainingApp .v360-day').length===5);
    const schedule=await page.evaluate(()=>[...document.querySelectorAll('#v360TrainingApp .v360-day:not([hidden])')].map(b=>b.querySelector('b')?.textContent));
    assert.deepEqual(schedule,['SEG','QUA','SEX','DOM']);
    await page.click('#v360TrainingApp [data-day="seg"]');
    await page.waitForFunction(()=>document.querySelector('#v363VideoBox .v363-main'));
    const monday=await page.evaluate(()=>({title:document.querySelector('#v360TrainingApp .v360-overview h2')?.textContent,cards:document.querySelectorAll('#v360TrainingApp .v360-ex').length,localImport:document.querySelector('#v363VideoBox .v363-main')?.textContent||'',legacyModal:!!document.getElementById('v360VideoModal')}));
    assert.equal(monday.title,'Inferiores completo');assert.equal(monday.cards,5);assert.equal(monday.legacyModal,false);assert.match(monday.localImport,/Importar vídeo da galeria|Ver execução do treino/);

    await page.evaluate(()=>window.setAppScreen('mais'));
    await page.waitForFunction(()=>document.querySelector('#mais .v367-schedule'));
    const more=await page.evaluate(()=>({text:document.getElementById('mais')?.textContent||'',days:document.querySelectorAll('#mais .v367-schedule>div').length}));
    assert.equal(more.days,7);assert.match(more.text,/4 treinos de musculação/);assert.doesNotMatch(more.text,/macro|refeiç|compras/i);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.7 weekly schedule browser audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});