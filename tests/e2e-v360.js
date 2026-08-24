const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block',timezoneId:'America/Manaus',hasTouch:true,isMobile:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173/?e2e=v3610',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.vitafitReady==='true'&&document.getElementById('v360TrainingApp'));

    const boot=await page.evaluate(()=>({build:document.documentElement.dataset.vitafitBuild,nav:document.querySelectorAll('.app-nav-btn').length,fast:window.setAppScreen?.__vitafitFast===true}));
    assert.equal(boot.build,'3.6.10');assert.equal(boot.nav,3);assert.equal(boot.fast,true);

    await page.evaluate(()=>window.setAppScreen('treino',{instant:true}));
    await page.waitForFunction(()=>document.querySelectorAll('#v369Week .v369-day').length===7);
    const week=await page.evaluate(()=>[...document.querySelectorAll('#v369Week .v369-day')].map(b=>({dow:+b.dataset.v369Dow,label:b.querySelector('b')?.textContent,type:b.querySelector('span')?.textContent,detail:b.querySelector('small')?.textContent})));
    assert.deepEqual(week.map(x=>x.dow),[1,2,3,4,5,6,0]);
    assert.deepEqual(week.filter(x=>x.type==='Cardio').map(x=>x.detail),['20 min','40 min','20 min']);
    assert.equal(await page.locator('#v360TrainingApp .v360-day').count(),4,'núcleo deve manter apenas quatro fichas de musculação');

    for(const dow of [1,3,5,0]){
      await page.click(`#v369Week [data-v369-dow="${dow}"]`);
      assert.equal(await page.locator('#v360TrainingApp .v360-day').count(),4,'troca de treino não pode recriar grade legada');
    }

    await page.click('#v369Week [data-v369-dow="2"]');
    assert.match(await page.locator('#v369CardioPanel h2').innerText(),/20 min de cardio/);
    await page.click('#v369Week [data-v369-dow="4"]');
    assert.match(await page.locator('#v369CardioPanel h2').innerText(),/40 min de cardio/);
    await page.click('#v369Week [data-v369-dow="6"]');
    assert.match(await page.locator('#v369CardioPanel h2').innerText(),/20 min de cardio/);

    await page.click('#v369Week [data-v369-dow="1"]');
    await page.waitForFunction(()=>document.querySelector('#v363VideoBox .v363-main'));
    assert.match(await page.locator('#v363VideoBox .v363-main').innerText(),/Importar vídeo da galeria|Ver execução do treino/);
    assert.deepEqual(errors,[],`Erros JS: ${errors.join(' | ')}`);
    console.log('VITAFIT 3.6.10 simple standard browser audit: OK');
  } finally {if(browser)await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});