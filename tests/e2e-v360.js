const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus',hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/?e2e=v368',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true'&&document.getElementById('v360TrainingApp'));

    const boot=await page.evaluate(()=>({build:document.documentElement.dataset.vitafitBuild,nav:document.querySelectorAll('.app-nav-btn').length,fast:window.setAppScreen?.__vitafitFast===true}));
    assert.equal(boot.build,'3.6.8');assert.equal(boot.nav,3);assert.equal(boot.fast,true);

    await page.evaluate(()=>window.setAppScreen('treino',{instant:true}));
    await page.waitForFunction(()=>document.getElementById('treino')?.classList.contains('active')&&document.querySelectorAll('#v360TrainingApp .v360-day').length===4);
    const days=await page.evaluate(()=>[...document.querySelectorAll('#v360TrainingApp .v360-day')].map(b=>({key:b.dataset.day,label:b.querySelector('b')?.textContent,title:b.querySelector('span')?.textContent})));
    assert.deepEqual(days.map(d=>d.key),['seg','qua','sex','dom']);
    assert.deepEqual(days.map(d=>d.label),['SEG','QUA','SEX','DOM']);

    for(const expected of [
      ['seg','Inferiores completo',5],
      ['qua','Superiores completo',5],
      ['sex','Inferiores completo',6],
      ['dom','Superiores completo',5]
    ]){
      await page.click(`#v360TrainingApp [data-day="${expected[0]}"]`);
      const state=await page.evaluate(()=>({title:document.querySelector('#v360TrainingApp .v360-overview h2')?.textContent,cards:document.querySelectorAll('#v360TrainingApp .v360-ex').length,days:document.querySelectorAll('#v360TrainingApp .v360-day').length}));
      assert.equal(state.title,expected[1]);assert.equal(state.cards,expected[2]);assert.equal(state.days,4,'um clique não pode recriar a grade antiga de 5 dias');
    }

    await page.waitForFunction(()=>document.querySelector('#v363VideoBox .v363-main'));
    assert.match(await page.locator('#v363VideoBox .v363-main').innerText(),/Importar vídeo da galeria|Ver execução do treino/);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.8 native four-day schedule browser audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});