const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/?e2e=v360',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true'&&document.getElementById('v360TrainingApp'));

    const boot=await page.evaluate(()=>({
      build:document.documentElement.dataset.vitafitBuild,
      nav:document.querySelectorAll('.app-nav-btn').length,
      version:[...document.querySelectorAll('.version')].map(x=>x.textContent),
      legacyHidden:document.getElementById('v360LegacyTraining')?.parentElement?.classList.contains('v360-ready')||false
    }));
    assert.equal(boot.build,'3.6.0');
    assert.equal(boot.nav,5);
    assert.ok(boot.version.some(v=>/3\.6\.0/.test(v)));
    assert.equal(boot.legacyHidden,true);

    await page.evaluate(()=>window.setAppScreen('treino',{instant:true}));
    await page.waitForFunction(()=>document.getElementById('treino')?.classList.contains('active')&&document.querySelectorAll('#v360TrainingApp .v360-day').length===5);

    await page.click('#v360TrainingApp [data-day="seg"]');
    const monday=await page.evaluate(()=>({
      title:document.querySelector('#v360TrainingApp .v360-overview h2')?.textContent,
      exercises:[...document.querySelectorAll('#v360TrainingApp .v360-ex h3')].map(x=>x.textContent),
      cards:document.querySelectorAll('#v360TrainingApp .v360-ex').length,
      sets:document.querySelectorAll('#v360TrainingApp .v360-set').length,
      videos:document.querySelectorAll('#v360TrainingApp .v360-video-btn').length
    }));
    assert.equal(monday.title,'Inferiores completo');
    assert.equal(monday.cards,5);
    assert.equal(monday.videos,5);
    assert.ok(monday.exercises.includes('Agachamento sumô'));
    assert.ok(monday.exercises.includes('Elevação pélvica'));

    const firstLoad=page.locator('#v360TrainingApp .v360-ex').first().locator('input[data-field="load"]').first();
    await firstLoad.fill('42');
    await page.locator('#v360TrainingApp .v360-ex').first().locator('input[data-field="reps"]').first().fill('20');
    await page.locator('#v360TrainingApp .v360-ex').first().locator('.v360-set-ok').first().click();
    const persisted=await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('shape12.v360.day.')&&k.endsWith('.load')&&localStorage.getItem(k)==='"42"'));
    assert.equal(persisted,true);

    await page.locator('#v360TrainingApp .v360-video-btn').first().click();
    await page.waitForFunction(()=>document.getElementById('v360VideoModal')?.classList.contains('open'));
    await page.waitForFunction(()=>document.getElementById('v360Video')?.src.startsWith('blob:'),null,{timeout:8000});
    const video=await page.evaluate(()=>({title:document.getElementById('v360VideoTitle')?.textContent,src:document.getElementById('v360Video')?.src||''}));
    assert.equal(video.title,'Agachamento sumô');
    assert.match(video.src,/^blob:/);
    await page.click('#v360VideoClose');

    await page.click('#v360TrainingApp [data-day="qua"]');
    const wed=await page.evaluate(()=>[...document.querySelectorAll('#v360TrainingApp .v360-ex h3')].map(x=>x.textContent));
    assert.ok(wed.includes('Cadeira extensora'));
    assert.ok(wed.includes('Leg press unilateral'));

    await page.click('#v360TrainingApp [data-day="sex"]');
    const fri=await page.evaluate(()=>[...document.querySelectorAll('#v360TrainingApp .v360-ex h3')].map(x=>x.textContent));
    assert.ok(fri.includes('Agachamento búlgaro'));
    assert.ok(fri.includes('Terra sumô'));
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.0 training rework browser audit: OK');
  } finally {
    if(browser)await browser.close();
  }
})().catch(e=>{console.error(e);process.exit(1)});
