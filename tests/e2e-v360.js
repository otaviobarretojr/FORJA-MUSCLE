const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus',hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/?e2e=v365',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true'&&document.getElementById('v360TrainingApp'));

    const boot=await page.evaluate(()=>({
      build:document.documentElement.dataset.vitafitBuild,
      nav:document.querySelectorAll('.app-nav-btn').length,
      nutritionNav:!!document.querySelector('.app-nav-btn[data-screen="nutricao"]'),
      programNav:!!document.querySelector('.app-nav-btn[data-screen="evolucao"]'),
      nutritionHidden:document.getElementById('nutricao')?.hidden===true,
      programGone:!document.getElementById('evolucao'),
      fast:window.setAppScreen?.__vitafitFast===true
    }));
    assert.equal(boot.build,'3.6.5');assert.equal(boot.nav,3);assert.equal(boot.nutritionNav,false);assert.equal(boot.programNav,false);assert.equal(boot.nutritionHidden,true);assert.equal(boot.programGone,true);assert.equal(boot.fast,true);

    await page.evaluate(()=>window.setAppScreen('treino',{instant:true}));
    await page.waitForFunction(()=>document.getElementById('treino')?.classList.contains('active')&&document.querySelectorAll('#v360TrainingApp .v360-day').length===5);
    await page.click('#v360TrainingApp [data-day="seg"]');
    const monday=await page.evaluate(()=>({title:document.querySelector('#v360TrainingApp .v360-overview h2')?.textContent,cards:document.querySelectorAll('#v360TrainingApp .v360-ex').length,localImport:document.querySelector('#v363VideoBox .v363-main')?.textContent||'',individualVideos:document.querySelectorAll('#v360TrainingApp .v360-video-btn').length}));
    assert.equal(monday.title,'Inferiores completo');assert.equal(monday.cards,5);assert.equal(monday.individualVideos,0);assert.match(monday.localImport,/Importar vídeo da galeria|Ver execução do treino/);

    const firstLoad=page.locator('#v360TrainingApp .v360-ex').first().locator('input[data-field="load"]').first();await firstLoad.fill('42');
    await page.locator('#v360TrainingApp .v360-ex').first().locator('input[data-field="reps"]').first().fill('20');
    await page.locator('#v360TrainingApp .v360-ex').first().locator('.v360-set-ok').first().click();
    assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('shape12.v360.day.')&&k.endsWith('.load')&&localStorage.getItem(k)==='"42"')),true);

    await page.evaluate(()=>window.setAppScreen('nutricao'));
    assert.equal(await page.evaluate(()=>document.getElementById('screen-hoje')?.classList.contains('active')||false),true);
    await page.evaluate(()=>window.setAppScreen('evolucao'));
    assert.equal(await page.evaluate(()=>document.getElementById('screen-hoje')?.classList.contains('active')||false),true);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.5 simplified browser audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
